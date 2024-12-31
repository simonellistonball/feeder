import { workerConfig } from "../config";
import { Worker } from "bullmq";
import { logger } from "../logger";
import type { GmailAttachmentJobData, GmailMessageJobData } from "../types";
import { gmail_list as gmail_list_job } from "./gmail_list";
import { gmail_message as gmail_message_job } from "./gmail_message";
import { gmail_attachment as gmail_attachment_job } from "./gmail_attachment";
import { gdrive_list as gdrive_list_job } from "./gdrive_list";
import { gdoc_fetch as gdoc_fetch_job } from "./gdoc_fetch";
import { gdrive_fetch as gdrive_fetch_job } from "./gdrive_fetch";
import { google } from "googleapis";
import { textAnalysis } from "./text_analysis";

google.options({
  http2: true,
});

const safety = 0.5;

export const gmail_list = () => {
  const worker = new Worker("gmail_list", gmail_list_job, {
    ...workerConfig("gmail_list"),
    useWorkerThreads: true,
    limiter: { max: (15000 / 5) * safety, duration: 60000 },
  });
  worker.on("error", (err) => {
    logger.error(err);
  });
  return worker;
};

export const gmail_message = () => {
  const worker = new Worker<GmailMessageJobData>(
    "gmail_message",
    gmail_message_job,
    {
      ...workerConfig("gmail_message"),
      useWorkerThreads: true,
      limiter: { max: 1, duration: 400 },
    }
  );
  worker.on("error", (err) => {
    logger.error(err);
  });
  return worker;
};

export const gmail_attachment = () => {
  const worker = new Worker<GmailAttachmentJobData>(
    "gmail_attachment",
    gmail_attachment_job,
    {
      ...workerConfig("gmail_attachment"),
      useWorkerThreads: true,
      limiter: { max: 1, duration: 2000 },
    }
  );
  worker.on("error", (err) => {
    logger.error(err);
  });
  return worker;
};

export const gdrive_list = () => {
  const worker = new Worker("gdrive_list", gdrive_list_job, {
    ...workerConfig("gdrive_list"),
    useWorkerThreads: true,
    limiter: { max: 1, duration: 60 / 12 / safety },
  });
  worker.on("error", (err) => {
    logger.error(err);
  });
  return worker;
};

export const gdrive_fetch = () => {
  const worker = new Worker("gdrive_fetch", gdrive_fetch_job, {
    ...workerConfig("gdrive_fetch"),
    useWorkerThreads: true,
    // uses a lot of requests, because of an intial get an export and a raw download
    limiter: { max: 1, duration: 1000 / safety },
  });
  worker.on("error", (err) => {
    logger.error(err);
  });
  return worker;
};

export const gdoc_fetch = () => {
  const worker = new Worker("gdoc_fetch", gdoc_fetch_job, {
    ...workerConfig("gdoc_fetch"),
    useWorkerThreads: true,
    // 300 per minute per user, 3000 per project
    limiter: { max: 1, duration: 200 / safety },
  });
  worker.on("error", (err) => {
    logger.error(err);
  });
  return worker;
};

export const text_analysis = () => {
  const worker = new Worker("text_analysis", textAnalysis, {
    ...workerConfig("text_analysis"),
    useWorkerThreads: true,
    // internal, so up to us
    limiter: { max: 1, duration: 1000 },
  });
  worker.on("error", (err) => {
    logger.error(err);
  });
  return worker;
};

export default {
  gmail_list,
  gmail_message,
  gmail_attachment,
  gdrive_list,
  gdrive_fetch,
  gdoc_fetch,
  text_analysis,
};
