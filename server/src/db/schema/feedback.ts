import { text, uuid } from "drizzle-orm/pg-core";
import { createTable, namedObject, trackingFields } from "../utils";
import { users } from "./users";

export const feedback = createTable("feedback", {
  ...namedObject,
  content: text("content").notNull(),
  summary: text("summary"),

  ...trackingFields,
});

export const feedbackCopiedUsers = createTable("feedback_copied_users", {
  feedbackId: uuid("feedback_id")
    .notNull()
    .references(() => feedback.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  ...trackingFields,
});
