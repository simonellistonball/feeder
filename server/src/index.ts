import dotenv from "dotenv";
dotenv.config();

import { logger } from "./logger";
import winston from "winston";
import expressWinston from "express-winston";

import express from "express";
import http from "http";

import { WebSocketServer } from "ws";
import { yoga } from "./yoga";
import { useServer } from "graphql-ws/lib/use/ws";

import { ExpressAuth } from "@auth/express";
import { currentSession } from "./middleware/auth.middleware";
import { authConfig } from "./config/auth.config";

const port = process.env.PORT ?? 4000;
const host = process.env.HOST ?? "localhost";

const app = express();
const server = http.createServer(app);

app.use(currentSession);

app.use(yoga.graphqlEndpoint, yoga);

const wsServer = new WebSocketServer({
  server,
  path: yoga.graphqlEndpoint,
});

useServer(
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: (args: any) => args.rootValue.execute(args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribe: (args: any) => args.rootValue.subscribe(args),
    onSubscribe: async (ctx, msg) => {
      const { schema, execute, subscribe, contextFactory, parse, validate } =
        yoga.getEnveloped({
          ...ctx,
          req: ctx.extra.request,
          socket: ctx.extra.socket,
          params: msg.payload,
        });

      const args = {
        schema,
        operationName: msg.payload.operationName,
        document: parse(msg.payload.query),
        variableValues: msg.payload.variables,
        contextValue: await contextFactory(),
        rootValue: {
          execute,
          subscribe,
        },
      };

      const errors = validate(args.schema, args.document);
      if (errors.length) return errors;
      return args;
    },
  },
  wsServer
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
      return false;
    }, // optional: allows to skip some log messages based on request and/or response
  })
);

app.set("trust proxy", true);
app.use("/auth/*", ExpressAuth(authConfig));

app.on("close", () => {
  logger.info("Server closed");
});

app.listen(process.env.PORT ?? 4000, () => {
  logger.info(`Running a GraphQL API server at http://${host}:${port}/graphql`);
});
