import {
  check,
  pgEnum,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createTable, namedObject, trackingFields } from "../utils";
import { users } from "./users";
import { relations, sql } from "drizzle-orm";
import { features } from "./products";

export const visbilityEnum = pgEnum(`${process.env.APP_NAME}_visibility`, [
  "public",
  "internal",
  "team",
  "private",
]);

export const statusEnum = pgEnum(`${process.env.APP_NAME}_status`, [
  "idea",
  "planning",
  "in_progress",
  "complete",
  "shipped",
  "canceled",
  "on_hold",
]);

export const releases = createTable("releases", {
  ...namedObject,
  productId: uuid("product_id")
    .notNull()
    .references(() => features.id),
  title: text("title"),
  description: text("description"),
  image: varchar("image", { length: 255 }),
  dateStart: timestamp("date_start", { mode: "date" }),
  dateEnd: timestamp("date_end", { mode: "date" }),
  ...trackingFields,
});

export const roadmaps = createTable(
  "roadmaps",
  {
    ...namedObject,
    productId: uuid("product_id")
      .notNull()
      .references(() => features.id),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    description: text("description"),
    color: varchar("color", { length: 8 }),
    image: varchar("image", { length: 255 }),
    visibility: visbilityEnum().notNull().default("private"),
    ...trackingFields,
  },
  (table) => [
    {
      checkConstraint: check(
        "roadmap_feature_color_check",
        sql`${table.color} is null or ${table.color} ~* '^#[a-f0-9]{8}$'`
      ),
    },
  ]
);

export const roadmapsEntries = createTable(
  "roadmaps_entries",
  {
    ...namedObject,
    roadmapId: uuid("roadmap_id")
      .notNull()
      .references(() => roadmaps.id),
    title: text("title"),
    description: text("description"),
    url: text("url"),
    featureId: uuid("feature_id").references(() => features.id),
    status: statusEnum("status").notNull().default("idea"),
    dateStart: timestamp("date_start", { mode: "date" }),
    dateEnd: timestamp("date_end", { mode: "date" }),
    releaseDate: timestamp("release_date", { mode: "date" }),
    releaseId: uuid("release_id").references(() => releases.id),
    releaseNotes: text("release_notes"),
    color: varchar("color", { length: 8 }),
    ...trackingFields,
  },
  (table) => [
    {
      checkConstraint: check(
        "roadmap_feature_color_check",
        sql`${table.color} is null or ${table.color} ~* '^#[a-f0-9]{8}$'`
      ),
    },
  ]
);

export const roadmapRelations = relations(roadmaps, ({ many }) => ({
  entries: many(roadmapsEntries),
}));
export const roadmapEntriesRelations = relations(
  roadmapsEntries,
  ({ one }) => ({
    roadmap: one(roadmaps, {
      fields: [roadmapsEntries.roadmapId],
      references: [roadmaps.id],
    }),
    feature: one(features, {
      fields: [roadmapsEntries.featureId],
      references: [features.id],
    }),
    release: one(releases, {
      fields: [roadmapsEntries.releaseId],
      references: [releases.id],
    }),
  })
);

export const releasesRelations = relations(releases, ({ one, many }) => ({
  product: one(features, {
    fields: [releases.productId],
    references: [features.id],
  }),
  entries: many(roadmapsEntries),
}));
