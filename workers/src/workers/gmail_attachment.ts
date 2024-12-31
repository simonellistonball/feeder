import { Job } from "bullmq";
import { getGmail } from "../apiUtils";
import type { GmailAttachmentJobData } from "../types";
import { db } from "../db";
import { gmailAttachment } from "../db/schema";
import { simpleParser } from "mailparser";
import path from "path";
import fs from "fs";
import { logger } from "src/logger";
import { eq } from "drizzle-orm";

export async function gmail_attachment(job: Job<GmailAttachmentJobData>) {
  const { ATTACHMENT_PATH } = process.env;
  if (!ATTACHMENT_PATH) {
    throw new Error("ATTACHMENT_PATH not set");
  }

  const { userId, messageId, attachmentId } = job.data;

  const gmail = await getGmail(userId);

  // if we have already grabbed it, don't bother
  const existingAttachment = await db.query.gmailAttachment.findFirst({
    where: eq(gmailAttachment.attachmentId, attachmentId),
  });

  if (existingAttachment) {
    logger.info(
      `Attachment ${attachmentId} already exists for message ${messageId}`
    );
    return;
  }

  await gmail.users.messages.attachments
    .get({
      id: attachmentId,
      messageId,
      userId: "me",
    })
    .then(async (attachment) => {
      // save the attachement content into an object store, and save a record or it, including the messageId and userId in a database table
      logger.info(
        `Got reponse from gmail for attachment ${attachmentId} ${attachment.data.data?.length} bytes`
      );
      await db.transaction(async (tx) => {
        // if the attachment already exists, don't save it again
        const dbAttachment = await tx.query.gmailAttachment.findFirst({
          where: (gmailAttachment, { and, eq }) =>
            and(
              eq(gmailAttachment.userId, userId),
              eq(gmailAttachment.messageId, messageId),
              eq(gmailAttachment.attachmentId, attachmentId)
            ),
        });
        if (dbAttachment) {
          console.log("Attachment already exists", dbAttachment);
          tx.rollback();
          return;
        }

        const raw = attachment.data.data!;
        // decode the mime encoded raw data and extract the filename and mime type
        const buffer = Buffer.from(raw, "base64");

        // dump the buffer to disk to debug why we can't parse it
        const filePath = path.join(
          ATTACHMENT_PATH,
          userId.slice(0, 2),
          userId.slice(2, 2),
          userId,
          "debug",
          crypto.randomUUID()
        );
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, buffer);

        logger.info(
          `Decoded attachment ${attachmentId} ${buffer.length} bytes, dumping to ${filePath}`
        );

        const parsed = await simpleParser(buffer);

        logger.info(
          `Parsed attachment ${attachmentId} ${parsed.attachments?.length}`
        );

        if (parsed.attachments && parsed.attachments.length > 0) {
          const attachmentInfo = parsed.attachments[0]; // Since we're dealing with single attachment

          // create an id (uuid) for the attachment
          const id = crypto.randomUUID();

          // generate a filepath using the userId and the id, add prefix poths to prevent too many files in a single directory
          const filePath = path.join(
            ATTACHMENT_PATH,
            userId.slice(0, 2),
            userId.slice(2, 2),
            userId,
            id.slice(0, 2),
            id
          );
          // save the attachment to the filePath
          await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
          await fs.promises.writeFile(filePath, buffer);

          const storedAt = filePath;

          const filename = attachmentInfo.filename ?? "unknown";
          const mimeType = attachmentInfo.contentType;

          logger.info(
            `Saved attachment ${filename} (${mimeType}) for message ${messageId} to ${storedAt}`
          );

          return await db
            .insert(gmailAttachment)
            .values({
              id,
              userId,
              messageId,
              attachmentId,
              filename: filename,
              mimeType: mimeType,
              storedAt: storedAt,
              size: buffer.length,
            })
            .execute();
        }
      });
    });
}
