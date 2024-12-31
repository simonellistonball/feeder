import { Queue } from "bullmq";
import { queueConfig } from "./config";
import type {
  GmailAttachmentJobData,
  GmailJobData,
  GmailMessageJobData,
  GdriveListJobData,
  GdriveFetchJobData,
  GdocFetchJobData,
  TextAnalysisJobData,
  FormatConversionJobData,
} from "./types";

// setup the queues
export const listQueue = new Queue<GmailJobData>(
  "gmail_list",
  queueConfig("gmail_list")
);
export const fetchQueue = new Queue<GmailMessageJobData>(
  "gmail_message",
  queueConfig("gmail_message")
);
export const fetchAttachmentQueue = new Queue<GmailAttachmentJobData>(
  "gmail_attachment",
  queueConfig("gmail_attachment")
);

export const listDriveQueue = new Queue<GdriveListJobData>(
  "gdrive_list",
  queueConfig("gdrive_list")
);

export const fetchDriveQueue = new Queue<GdriveFetchJobData>(
  "gdrive_fetch",
  queueConfig("gdrive_fetch")
);
export const fetchDocsQueue = new Queue<GdocFetchJobData>(
  "gdoc_fetch",
  queueConfig("gdoc_fetch")
);

export const textAnalysisQueue = new Queue<TextAnalysisJobData>(
  "text_analysis",
  queueConfig("text_analysis")
);

export const formatConversionQueue = new Queue<FormatConversionJobData>(
  "format_conversion",
  queueConfig("format_conversion")
);
