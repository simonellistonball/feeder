import "dotenv/config";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import winston from "winston";
import expressWinston from "express-winston";
import { logger } from "./logger";
import {
  fetchAttachmentQueue,
  fetchDocsQueue,
  fetchDriveQueue,
  fetchQueue,
  formatConversionQueue,
  listDriveQueue,
  listQueue,
  textAnalysisQueue,
} from "./queues";
import { otelSetup } from "./otel";

const run = async () => {
  const app = express();

  otelSetup();

  app.use(bodyParser.json());
  app.use(
    cors({
      origin: "http://localhost:4000",
    })
  );

  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      ),
      meta: true, // optional: control whether you want to log the meta data about the request (default to true)
      msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
      ignoreRoute: function (req, res) {
        if (req.url.startsWith("/ui")) {
          return true;
        }
        return false;
      }, // optional: allows to skip some log messages based on request and/or response
    })
  );

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/ui");

  createBullBoard({
    queues: [
      new BullMQAdapter(listQueue),
      new BullMQAdapter(fetchQueue),
      new BullMQAdapter(fetchAttachmentQueue),
      new BullMQAdapter(fetchDriveQueue),
      new BullMQAdapter(listDriveQueue),
      new BullMQAdapter(fetchDocsQueue),
      new BullMQAdapter(textAnalysisQueue),
      new BullMQAdapter(formatConversionQueue),
    ],
    serverAdapter,
  });

  app.use("/ui", serverAdapter.getRouter());

  app.post("/job", async (req, res) => {
    const jobSpec = req.body as { name: string; data: Record<string, any> };
    logger.info(`Received job spec ${JSON.stringify(jobSpec)}`);
    try {
      if (jobSpec.name === "gmail_list") {
        // add a new listing request job
        const job = await listQueue.add("gmail_list", {
          userId: jobSpec.data.userId!.toString(),
        });
        res.status(202).send("Added job");
      } else if (jobSpec.name === "gdrive_list") {
        // add a new listing request job
        const job = await listDriveQueue.add("gdrive_list", {
          userId: jobSpec.data.userId!.toString(),
          q: jobSpec.data.q,
        });
        res.status(202).send("Added job");
      } else if (jobSpec.name === "gdoc_fetch") {
        const job = await fetchDocsQueue.add("gdoc_fetch", {
          userId: jobSpec.data.userId!.toString(),
          documentId: jobSpec.data.documentId!.toString(),
        });
        res.status(202).send("Added job");
      } else {
        res.status(404).send("Not found");
      }
    } catch (err) {
      if (err instanceof TypeError) {
        logger.error(`Invalid job spec ${JSON.stringify(jobSpec)}`);
        res.status(400).send("Invalid job spec");
      } else {
        throw err;
      }
    }
  });

  const port = process.env.port ?? 4001;

  app.listen(port, () => {
    logger.info(`Running on ${port}...`);
    logger.info(`For the UI, open http://localhost:${port}/ui`);
  });
};

// eslint-disable-next-line no-console
run().catch((e) => console.error(e));
