import {
  bigint,
  index,
  integer,
  json,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createTable } from "../utils";

export const gmailList = createTable("gmail_list_response", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: varchar("job_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  response: json("response").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const gmailMessage = createTable(
  "gmail_message_response",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: varchar("job_id", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),

    messageId: varchar("message_id", { length: 255 }).unique().notNull(),
    payload: text("payload"),
    snippet: text("snippet"),
    historyId: varchar("history_id", { length: 255 }),
    internalDate: bigint("internal_date", { mode: "number" }),
    sizeEstimate: integer("size_estimate"),
    raw: text("raw"),

    fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      nameIdx: index("workers_messages_messageId_idx").on(table.messageId),
    };
  }
);

export const gmailAttachment = createTable("gmail_attachment", {
  id: uuid("id").primaryKey(),
  userId: varchar("message_id", { length: 255 }).notNull(),
  messageId: varchar("message_id", { length: 255 })
    .notNull()
    .references(() => gmailMessage.messageId),
  attachmentId: varchar("attachment_id", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  storedAt: varchar("stored_at", { length: 255 }).notNull(),
  size: integer("size").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});
