import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import * as views from "./views";
import { DefaultLogger, LogWriter } from "drizzle-orm";
import { logger } from "../logger";

declare global {
  // eslint-disable-next-line no-var
  var cachedConnection: postgres.Sql | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const connection =
  global.cachedConnection ??
  postgres(process.env.DATABASE_URL, {
    ssl: process.env.NODE_ENV === "production",
    max: 1,
  });

if (process.env.NODE_ENV !== "production") {
  global.cachedConnection = connection;
}

class WinstonLogWriter implements LogWriter {
  write(message: string) {
    logger.info(message);
  }
}
export const db = drizzle(connection, {
  logger: new DefaultLogger({ writer: new WinstonLogWriter() }),
  schema: { ...schema, ...views },
});
