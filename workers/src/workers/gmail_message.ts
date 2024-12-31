import "dotenv/config";

import { Job } from "bullmq";
import { checkRates, getGmail, RateLimitErrorWithTime } from "../apiUtils";
import { db } from "../db";
import { logger } from "../logger";
import { gmailMessage } from "../db/schema";
import type { GmailMessageJobData } from "../types";
import { inArray } from "drizzle-orm";
import { fetchAttachmentQueue } from "../queues";
import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("feedrouter-workers");

export async function gmail_message(job: Job<GmailMessageJobData>) {
  const { userId } = job.data;

  // let's just check we haven't already got the message in the cache
  tracer.startActiveSpan("gmail_message", async (span) => {
    span.setAttribute("userId", userId);
    span.setAttribute("messageId", job.data.messages[0]);

    const gmail = await getGmail(userId);

    const dbSpan = tracer.startSpan("db.query.cachedMessages");
    const cachedCopies = await db.query.gmailMessage.findMany({
      where: inArray(
        gmailMessage.messageId,
        job.data.messages.map((id) => id)
      ),
      columns: { id: true, messageId: true },
    });
    dbSpan.end();

    // quick optimization, if we have all the messages in the cache, we can skip this job
    if (cachedCopies.length === job.data.messages.length) {
      span.end();
      return;
    }
    // if there is nothing returned from the cache, we need to fetch everything, so don't bother filtering
    const messagesToProcess =
      cachedCopies.length === 0
        ? job.data.messages
        : job.data.messages.filter(
            (id) => !cachedCopies.find((message) => message.messageId === id)
          );
    logger.info(
      `Processing ${messagesToProcess.length} messages for ${userId} cache hits: ${cachedCopies.length}`
    );
    span.setAttribute("cacheHits", cachedCopies.length);
    span.setAttribute("messagesToProcess", messagesToProcess.length);
    const results = Promise.all(
      messagesToProcess.map((id, index, arr) => {
        const apiSpan = tracer.startSpan("gmail.messages.get");
        apiSpan.setAttribute("messageId", id);
        const result = gmail.users.messages
          .get({ userId: "me", id })
          .then((res) => {
            if (res.status != 200) {
              logger.error(`Error fetching message ${id} for ${userId}`);
              logger.info(JSON.stringify(res));
              apiSpan.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Error fetching message",
              });
              apiSpan.end();
            }
            apiSpan.setAttribute(
              "messageSize",
              res.data?.sizeEstimate?.toString() || ""
            );

            return res;
          })
          .then((res) => {
            checkRates(res);
            return res;
          })
          .then(async (res) => {
            // save the message to a database
            const message = res.data;
            const dbSpan = tracer.startSpan("db.insert", {
              attributes: {
                messageId: message.id!,
              },
            });
            await db
              .insert(gmailMessage)
              .values({
                jobId: job.id?.toString() ?? "",
                userId: job.data.userId,
                messageId: message.id!,
                payload: JSON.stringify(message.payload!),
                snippet: message.snippet!,
                historyId: message.historyId!,
                internalDate: parseInt(message.internalDate!),
                sizeEstimate: message.sizeEstimate!,
                raw: message.raw,
              })
              .onConflictDoUpdate({
                target: [gmailMessage.messageId],
                set: {
                  payload: JSON.stringify(message.payload!),
                  snippet: message.snippet!,
                  historyId: message.historyId!,
                  internalDate: parseInt(message.internalDate!),
                  sizeEstimate: message.sizeEstimate!,
                  raw: message.raw,
                },
              })
              .execute()
              .catch((err) => {
                logger.error(
                  `error inserting message ${message.id}, ${err.message}`
                );
                dbSpan.recordException(err);
                dbSpan.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: err.message,
                });
                throw err;
              });
            dbSpan.end();
            return message;
          })
          .then((message) => {
            // process the message
            const payload = message.payload;
            // qeuue any attachments
            if (payload?.parts) {
              payload.parts.forEach((part) => {
                if (part.body?.attachmentId) {
                  // queue the attachment
                  fetchAttachmentQueue.add(
                    "gmail_attachment",
                    {
                      userId: job.data.userId,
                      messageId: message.id!,
                      attachmentId: part.body.attachmentId,
                    },
                    {
                      jobId:
                        job.data.userId + message.id + part.body.attachmentId,
                    }
                  );
                }
              });
            }
          })
          .then(async () => {
            await job.updateProgress(index / arr.length);
          })
          .catch((err) => {
            if (apiSpan.isRecording()) apiSpan.end();

            if (err.code === 404) {
              return;
            }
            if (err.code === 403) {
              logger.error("403 error", err);
              logger.info(JSON.stringify(err));
              throw new RateLimitErrorWithTime(10000);
            }
            if (err.status === 429) {
              logger.error("Rate limit hit");
              throw new RateLimitErrorWithTime(10000);
            }
            span.recordException(err);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: err.message,
            });
            logger.debug(JSON.stringify(err));
            throw err;
          });
        return result;
      })
    );
    span.end();
    return results;
  });
}
