import { Job } from "bullmq";
import { google } from "googleapis";
import { getGoogleAuth } from "src/apiUtils";
import { logger } from "src/logger";
import { fetchDriveQueue, listDriveQueue } from "src/queues";
import type { GdriveListJobData } from "src/types";

const mimesToFetch = [
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.google-apps.presentation",
  "text/plain",
  "text/html",
  "application/xhtml+xml",
  "text/csv",
  "text/rtf",
  "text/calendar",
  "application/xml",
  "text/xml",
  "application/msword",
  "application/json",
  "application/rtf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/pdf",
  "application/epub+zip",
  "application/zip",
];

export async function gdrive_list(job: Job<GdriveListJobData>) {
  // this job will connect to a user's google docs, and queue the docs they have available for analysis
  const oauth2client = await getGoogleAuth(job.data.userId);
  const drive = google.drive({ version: "v3", auth: oauth2client });
  drive.files
    .list({
      pageSize: 50,
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
      q: job.data.q,
      pageToken: job.data.nextPageToken,
    })
    .then(async (res) => {
      if (res?.data.nextPageToken) {
        console.log("nextPageToken: " + res.data.nextPageToken);
        await listDriveQueue.add(
          "gdoc_list",
          {
            ...job.data,
            nextPageToken: res.data.nextPageToken,
          },
          {
            jobId: job.data.userId + res.data.nextPageToken,
          }
        );
      }
      return res;
    })

    .then((res) => {
      const all_files = res!.data.files || [];

      const files = all_files.filter((file) =>
        mimesToFetch.includes(file.mimeType || "")
      );

      files.forEach((file) => {
        logger.info(
          `Processing file: ${file.name} (${file.id}) type: ${file.mimeType}`
        );
      });

      return files;
    })

    .then((files) => {
      logger.info(`Found ${files.length} files`);
      if (files.length) {
        fetchDriveQueue.addBulk(
          files.map((file) => ({
            name: "gdrive_fetch",
            data: {
              userId: job.data.userId,
              fileId: file.id!,
            },
            opts: {
              jobId: job.data.userId + file.id,
            },
          }))
        );
      } else {
        console.log("No files found.");
      }
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
}
