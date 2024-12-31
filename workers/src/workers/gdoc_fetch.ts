import { Job } from "bullmq";
import { google } from "googleapis";
import { getGoogleAuth } from "src/apiUtils";
import { db } from "src/db";
import { gdocs } from "src/db/schema";
import { logger } from "src/logger";
import { textAnalysisQueue } from "src/queues";
import type { GdocFetchJobData } from "src/types";

export async function gdoc_fetch(job: Job<GdocFetchJobData>) {
  const { userId, documentId } = job.data;
  // this job will connect to a user's google docs, and queue the docs they have available for analysis
  const oauth2client = await getGoogleAuth(userId);
  const docs = google.docs({ version: "v1", auth: oauth2client });
  docs.documents
    .get({
      documentId: documentId,
    })
    .then((res) => {
      if (res.data?.body?.content) {
        const textRuns = res.data.body.content.map((content) => {
          if (content.paragraph) {
            content.paragraph.elements?.forEach((element) => {
              if (element.textRun) {
                return element.textRun.content;
              }
            });
          }
        });
        return { response: res, documentId, text: textRuns.join(" ") };
      }
    })
    .then((res) =>
      db
        .insert(gdocs)
        .values({
          documentId: documentId,
          text: res?.text,
          response: res?.response,
          userId: userId,
          fetchedAt: new Date(),
        })
        .returning({ id: gdocs.id })
        .execute()
    )
    .then((doc) => {
      doc.forEach(({ id }) => {
        logger.info(`Added document ${id} to database`);
        textAnalysisQueue.add(
          "text_analysis",
          {
            src: { type: "gdoc", documentId: documentId },
          },
          { jobId: "analysis-gdoc-" + documentId }
        );
      });
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
}
