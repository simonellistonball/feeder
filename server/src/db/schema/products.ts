import {
  AnyPgColumn,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createTable, namedObject, trackingFields } from "../utils";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const product = createTable("products", {
  ...namedObject,
  description: text("description").notNull(),
  productGroup: uuid("product_group").references(
    (): AnyPgColumn => productGroup.id
  ),
  ...trackingFields,
});

export const productGroup = createTable("product_groups", {
  ...namedObject,
  ...trackingFields,
});

export const features = createTable("features", {
  ...namedObject,
  parentId: uuid("parent_id").references((): AnyPgColumn => features.id),
  productId: uuid("product_id").references(() => product.id),
  description: text("description").notNull(),
  ...trackingFields,
});

export const productRelations = relations(product, ({ many }) => ({
  features: many(features),
}));
export const productGroupRelations = relations(productGroup, ({ many }) => ({
  products: many(product),
}));
export const featuresRelations = relations(features, ({ one, many }) => ({
  product: one(product, {
    fields: [features.productId],
    references: [product.id],
  }),
  parent: one(features, {
    fields: [features.parentId],
    references: [features.id],
  }),
  children: many(features, { relationName: "children" }),
}));

export const teams = createTable("teams", {
  ...namedObject,
  ...trackingFields,
});

export const teamRoles = createTable("team_roles", {
  ...namedObject,
  description: text("description"),
  abbr: varchar("abbr", { length: 20 }),
  ...trackingFields,
});

export const teamMembers = createTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id),
  userId: uuid("user_id").references(() => users.id),
  roleId: uuid("role_id").references(() => teamRoles.id),
  // these dates are include to track history of team membership
  dateStart: timestamp("date_start", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dateEnd: timestamp("date_end", { withTimezone: true }),
  ...trackingFields,
});

export const teamRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  teamRoles: many(teamRoles),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  role: one(teamRoles, {
    fields: [teamMembers.roleId],
    references: [teamRoles.id],
  }),
}));

export const teamRolesRelations = relations(teamRoles, ({ many }) => ({
  teamMembers: many(teamMembers),
}));
