import { Job } from "bullmq";
import { drive_v3, google } from "googleapis";
import { getGoogleAuth } from "src/apiUtils";
import { logger } from "src/logger";
import type { GdriveFetchJobData } from "src/types";
import fs from "fs";
import path from "path";
import type { GaxiosResponse } from "gaxios";
import { db } from "src/db";
import { gdrivefiles } from "src/db/schema";
import { formatConversionQueue, textAnalysisQueue } from "src/queues";

const { FILE_PATH } = process.env;
if (!FILE_PATH) {
  throw new Error("FILE_PATH not set");
}

const mimeMap = {
  "application/vnd.google-apps.document": ".gdoc",
  "application/vnd.google-apps.spreadsheet": ".gsheet",
  "application/vnd.google-apps.presentation": ".gslides",
  "text/plain": ".txt",
  "text/html": ".html",
  "application/xhtml+xml": ".xhtml",
  "text/csv": ".csv",
  "text/rtf": ".rtf",
  "text/calendar": ".ics",
  "application/xml": ".xml",
  "text/xml": ".xml",
  "application/msword": ".doc",
  "application/json": ".json",
  "application/rtf": ".rtf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "application/pdf": ".pdf",
  "application/epub+zip": ".epub",
  "application/zip": ".zip",
  "application/octet-stream": ".bin",
};

const convertMimes = ["application/vnd.google-apps.document"];

const downloadMimes = [
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
  "application/octet-stream",
];

type MIME_TYPE = keyof typeof mimeMap;
const mimesToFetch = Object.keys(mimeMap);

function extensionFromMime(mime: keyof typeof mimeMap) {
  return mimeMap[mime] || ".bin";
}

export async function gdrive_fetch(job: Job<GdriveFetchJobData>) {
  const { userId, fileId } = job.data;
  // this job will connect to a user's google docs, and queue the docs they have available for analysis
  const oauth2client = await getGoogleAuth(userId);
  const drive = google.drive({ version: "v3", auth: oauth2client });

  async function getText(
    fileId: string,
    filePath: string,
    res: GaxiosResponse<drive_v3.Schema$File>
  ) {
    const mimeType = res.data.mimeType as MIME_TYPE;
    if (
      parseInt(res.data.size ?? "0") < 10 * 1024 * 1024 &&
      convertMimes.includes(mimeType)
    ) {
      return drive.files
        .export(
          {
            fileId: fileId,
            mimeType: "text/plain",
          },
          {
            responseType: "stream",
          }
        )
        .then((res) => {
          if (res.status === 400) {
            throw new CannotConvertError(
              `Cannot convert file ${fileId}`,
              mimeType
            );
          }
          if (res.status !== 200) {
            logger.error(`Error: ${res.status}, ${res.statusText}`);
            logger.info(JSON.stringify(res.data));
            logger.info(`Error getting file ${fileId} of type ${mimeType}`);
            throw new Error("Error getting file");
          }
          return res;
        })
        .then((res) => {
          const fileName = filePath + ".txt";
          res.data.pipe(fs.createWriteStream(fileName));
          return fileName;
        });
    } else {
      return Promise.resolve(null);
    }
  }

  async function getRaw(
    fileId: string,
    filePath: string,
    res: GaxiosResponse<drive_v3.Schema$File>
  ) {
    const mimeType = res.data.mimeType as MIME_TYPE;
    const fileName = filePath + extensionFromMime(mimeType);
    if (!downloadMimes.includes(mimeType)) {
      return Promise.resolve(null);
    }
    return drive.files
      .get(
        {
          fileId: fileId,
          alt: "media",
        },
        {
          responseType: "stream",
        }
      )
      .then((res) => {
        res.data.pipe(fs.createWriteStream(fileName));
        return fileName;
      })
      .catch((err) => {
        if (err instanceof CannotConvertError) {
          logger.warn(err.message);
          logger.info(`Unable to convert ${err.mimeType}`);
          return null;
        }
        throw err;
      });
  }

  async function writeMeta(
    fileId: string,
    filePath: string,
    res: GaxiosResponse<drive_v3.Schema$File>
  ) {
    const fileName = filePath + ".json";
    return fs.promises.writeFile(
      fileName,
      JSON.stringify({ fileId, data: res.data }, null, 2),
      "utf8"
    );
  }

  drive.files
    .get({
      fileId: fileId,
    })
    .then(async (res) => {
      const mimeType = res.data.mimeType;
      if (!mimeType) {
        throw new Error("No mimeType");
      }
      if (res?.data.mimeType && mimesToFetch.includes(res.data.mimeType)) {
        const storeId = crypto.randomUUID();
        const filePath = path.join(
          FILE_PATH!,
          userId.slice(0, 2),
          userId.slice(2, 2),
          userId,
          storeId.slice(0, 2),
          storeId
        );

        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

        return Promise.all([
          getText(fileId, filePath, res),
          getRaw(fileId, filePath, res),
          writeMeta(fileId, filePath, res),
          // and get the raw form as well
        ])
          .then((res) => {
            return { textFile: res[0], rawFile: res[1], mimeType };
          })
          .then((res) => {
            if (res.textFile) {
              // send the text file for text analysis via the job queue
              return textAnalysisQueue
                .add("text_analyze", {
                  src: { type: "file", filePath: res.textFile },
                })
                .then(() => res);
            }
            if (res.rawFile) {
              // send the raw file for text analysis via the job queue
              return formatConversionQueue
                .add("format_convert", {
                  fileId,
                  filePath: res.rawFile,
                  mimeType,
                })
                .then(() => res);
            }
            return res;
          });
      }
    })
    .then(async (res) => {
      if (!res) {
        throw new Error("Cannot get file");
      }
      res.textFile && logger.info(`Text saved to ${res.textFile}`);
      res.rawFile &&
        logger.info(`Raw saved to ${res.rawFile} as ${res.mimeType}`);
      logger.info(`Finished processing ${fileId}`);

      await db.insert(gdrivefiles).values({
        userId: userId,
        fileId: fileId,
        rawFile: res.rawFile,
        textFile: res.textFile,
        mimeType: res.mimeType,
        fetchedAt: new Date(),
      });
    })
    .catch((err) => {
      logger.error(`Error processing ${fileId}: ${err.message}`);
      throw err;
    });
}

class CannotConvertError extends Error {
  constructor(message: string, public mimeType: string) {
    super(message);
    this.name = "CannotConvertError";
  }
}
