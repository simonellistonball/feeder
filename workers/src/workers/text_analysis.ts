import { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { db } from "src/db";
import { gdocs, gmailMessage } from "src/db/schema";
import type { TextAnalysisJobData } from "src/types";
import fs from "fs";

export async function textAnalysis(job: Job<TextAnalysisJobData>) {
  const { src } = job.data;
  // this job will connect to a user's google docs, and queue the docs they have available for analysis
  const text = await getText(src);
  // do some text analysis
  console.log(text);
}

async function getText(
  src:
    | { type: "gdoc"; documentId: string }
    | { type: "gmail"; messageId: string }
    | { type: "url"; url: string }
    | { type: "file"; filePath: string }
) {
  if (src.type === "gdoc") {
    // get the text from the database
    return db.query.gdocs
      .findFirst({ where: eq(gdocs.documentId, src.documentId) })
      .then((doc) => {
        return doc?.text || "";
      });
  }
  if (src.type === "gmail") {
    // get the message from the database
    return db.query.gmailMessage
      .findFirst({ where: eq(gmailMessage.messageId, src.messageId) })
      .then((doc) => {
        // grab all the text out of the message parts
        if (!doc?.payload) {
          throw new Error("No payload found for message " + src.messageId);
        }
        return JSON.parse(doc?.payload)
          .parts.filter((part: any) => part.mimeType === "text/plain")
          .map((part: any) => part.body.data)
          .join("");
      });
  }
  if (src.type === "url") {
    // fetch the url and extract text
  }
  if (src.type === "file") {
    // read the file and extract text
    fs.promises
      .readFile(src.filePath, "utf8")
      .then((text) => {
        return text;
      })
      .catch((err) => {
        throw new Error("Error reading file " + src.filePath);
      });
  }
}
