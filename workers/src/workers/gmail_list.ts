import { Job } from "bullmq";
import { checkRates, getGmail } from "../apiUtils";
import { db } from "../db";
import { gmailList } from "../db/schema";
import { gmail_v1 } from "googleapis";
import type { GmailJobData } from "../types";
import { fetchQueue, listQueue } from "../queues";
import { logger } from "../logger";

const CHUNK_SIZE = 50;

export async function gmail_list(job: Job<GmailJobData>) {
  const { userId } = job.data;
  const gmail = await getGmail(userId);
  logger.info(`Listing messages for ${userId} page {job.data.nextPageToken}`);
  await gmail.users.messages
    .list({
      userId: "me",
      maxResults: 500,
      pageToken: job.data.nextPageToken,
    })
    .then(async (list) => {
      // store the list data, just because
      await db
        .insert(gmailList)
        .values({
          userId: job.data.userId,
          response: JSON.stringify(list),
          jobId: job.id!,
        })
        .execute();

      return list;
    })
    .then((list) => {
      checkRates(list);
      return list;
    })
    .then(async (list) => {
      // queue the next page
      if (list.data.nextPageToken) {
        logger.info(`Queueing next page ${list.data.nextPageToken}`);
        await listQueue.add(
          "gmail_list",
          {
            ...job.data,
            nextPageToken: list.data.nextPageToken,
          },
          {
            jobId: job.data.userId + list.data.nextPageToken,
          }
        );
      }
      return list;
    })
    .then(async (list) => {
      // process the messages
      const allMessages = list.data.messages!;

      // map the messages to chunks to create an array of chunks with slices of a given chunk size
      const chunkedMessages = allMessages.reduce(
        (acc, message, index: number) => {
          const chunkIndex = Math.floor(index / CHUNK_SIZE);
          if (!acc[chunkIndex]) {
            acc[chunkIndex] = [];
          }
          acc[chunkIndex].push(message);
          return acc;
        },
        [] as gmail_v1.Schema$Message[][]
      );
      await fetchQueue.addBulk(
        chunkedMessages.map((chunk) => ({
          name: "gmail_message_batch",
          data: {
            userId: job.data.userId,
            messages: chunk.map((message) => message.id!),
          },
          opts: {
            jobId: job.data.userId + chunk[0].id!,
          },
        }))
      );
    });
}
