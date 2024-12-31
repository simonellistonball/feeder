// add a lookup table

import { relations } from "drizzle-orm";
import { userDataSourceRole, users } from "./schema/users";
import {
  AnyPgColumn,
  pgTableCreator,
  boolean,
  text,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";

const APP_NAME = process.env.APP_NAME;
if (!APP_NAME) {
  throw new Error("APP_NAME is not set");
}

export const createTable = pgTableCreator((name) => `${APP_NAME}_${name}`);
export const createIndex = (name: string) => index(`${APP_NAME}_${name}`);

// standard fields
export const trackingFields = {
  createdById: uuid("created_by_id")
    .notNull()
    .references((): AnyPgColumn => users.id),
  updatedById: uuid("updated_by_id").references((): AnyPgColumn => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  dataSourceId: uuid("data_source_id").references(
    (): AnyPgColumn => dataSources.id,
    { onDelete: "cascade" }
  ),
};

// a simple named object
export const namedObject = {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
};

// The data sources table is used to track all other objects origin, and can be very useful for enforcing deleting all data from a particular source
export const dataSources = createTable("data_sources", {
  ...namedObject,
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
});

export const dataSourceRelations = relations(dataSources, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [dataSources.tenantId],
    references: [tenants.id],
  }),
  userDataSourceRole: many(userDataSourceRole),
}));

export const tenants = createTable("tenant", {
  ...namedObject,
  domain: varchar("domain", { length: 255 }),
  createdById: uuid("created_by_id").references((): AnyPgColumn => users.id),
  updatedById: uuid("updated_by_id").references((): AnyPgColumn => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const tenantRelations = relations(tenants, ({ many }) => ({
  dataSources: many(dataSources),
}));

export const lookups = {
  ...namedObject,
  ...trackingFields,
};
