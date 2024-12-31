import { json, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createTable } from "../utils";

export const gdocs = createTable("gdocs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  documentId: varchar("document_id", { length: 255 }).notNull(),
  text: text("text"),
  response: json("response").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const gdrivefiles = createTable("gdrive_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  fileId: varchar("document_id", { length: 255 }).notNull(),
  textFile: varchar("text_file"),
  rawFile: varchar("raw_file"),
  mimeType: varchar("mime_type", { length: 255 }),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});
