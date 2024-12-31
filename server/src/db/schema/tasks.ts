import {
  AnyPgColumn,
  pgEnum,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createTable, namedObject, trackingFields } from "../utils";
import { relations } from "drizzle-orm";
import { logs } from "@opentelemetry/sdk-node";
import { product } from "./products";
import { releases } from "./roadmaps";
import { feedback } from "./feedback";

export const importanceEnum = pgEnum("importance", [
  "low",
  "medium",
  "high",
  "critical",
]);
export const ragEnum = pgEnum("rag", ["red", "amber", "green"]);
export const taskStatusEnum = pgEnum("status", ["todo", "in_progress", "done"]);

export const checklist = createTable("checklist", {
  ...namedObject,
  productId: uuid("product_id").references(() => product.id),
  releaseId: uuid("release_id").references(() => releases.id),
  feedbackId: uuid("feedback_id").references(() => feedback.id),
  ...trackingFields,
});

export const checklistItem = createTable("checklist_item", {
  ...namedObject,
  ...trackingFields,
  checklistId: uuid("checklist_id")
    .notNull()
    .references(() => checklist.id),
  productId: uuid("product_id").references(() => product.id),
  releaseId: uuid("release_id").references(() => releases.id),
  feedbackId: uuid("feedback_id").references(() => feedback.id),
  text: text("text").notNull(),
  importance: importanceEnum("importance"),
  rag: ragEnum("rag"),
  status: taskStatusEnum("status").notNull().default("todo"),
  notes: text("notes"),
  pathToGreen: text("path_to_green"),
  completed: timestamp("completed"),
});

export const checklistItemLog = createTable("checklist_item_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  checklistItemId: uuid("checklist_item_id")
    .notNull()
    .references(() => checklistItem.id),
  status: taskStatusEnum("status").notNull(),
  notes: text("notes"),
  rag: ragEnum("rag"),
  pathToGreen: text("path_to_green"),
  logDate: timestamp("log_date").defaultNow().notNull(),
  ...trackingFields,
});

export const checklistRelations = relations(product, ({ many }) => ({
  items: many(checklistItem),
}));

export const checklistItemRelations = relations(
  checklistItem,
  ({ one, many }) => ({
    checklist: one(product, {
      fields: [checklistItem.checklistId],
      references: [product.id],
    }),
    logs: many(checklistItemLog),
  })
);

export const checklistItemLogRelations = relations(
  checklistItemLog,
  ({ one }) => ({
    checklistItem: one(checklistItem, {
      fields: [checklistItemLog.checklistItemId],
      references: [checklistItem.id],
    }),
  })
);

export const checkListTemplate = createTable("checklist_template", {
  ...namedObject,
  ...trackingFields,
});

export const checkListItemsTemplate = createTable("checklist_items_template", {
  ...namedObject,
  checklistTemplateId: uuid("checklist_template_id")
    .notNull()
    .references(() => checkListTemplate.id),
  text: text("text").notNull(),
  importance: importanceEnum("importance").notNull(),
  rag: ragEnum("rag"),
  status: taskStatusEnum("status").notNull().default("todo"),
  notes: text("notes"),
  pathToGreen: text("path_to_green"),
  ...trackingFields,
});

export const checkListTemplateRelations = relations(
  checkListTemplate,
  ({ many }) => ({
    items: many(checkListItemsTemplate),
  })
);

export const checkListItemsTemplateRelations = relations(
  checkListItemsTemplate,
  ({ one }) => ({
    checklist: one(checkListTemplate, {
      fields: [checkListItemsTemplate.checklistTemplateId],
      references: [checkListTemplate.id],
    }),
  })
);
