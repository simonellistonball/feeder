// add a lookup table

import {
  pgTableCreator,
  boolean,
  text,
  uuid,
  index,
} from "drizzle-orm/pg-core";

const APP_NAME = process.env.APP_NAME;
if (!APP_NAME) {
  throw new Error("APP_NAME is not set");
}

export const createTable = pgTableCreator((name) => `${APP_NAME}_${name}`);
export const createIndex = (name: string) => index(`${APP_NAME}_${name}`);

// a simple named object
export const namedObject = {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
};

export const lookups = {
  ...namedObject,
};
