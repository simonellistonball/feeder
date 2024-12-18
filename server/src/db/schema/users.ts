import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  index,
  integer,
  pgEnum,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  createTable,
  dataSources,
  namedObject,
  tenants,
  trackingFields,
} from "../utils";
import { teamMembers } from "./products";

/* System Schems for Users, Sessions etc */
export const users = createTable("user", {
  ...namedObject,
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  source: varchar("source", { length: 255 }),
  ...trackingFields,
  createdById: uuid("created_by_id").references((): AnyPgColumn => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  teamMembers: many(teamMembers),
  userTenants: many(userTenants),
  userDataSourceRole: many(userDataSourceRole),
}));

export const accounts = createTable(
  "account",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
      userIdIdx: index("account_user_id_idx").on(account.userId),
    },
  ]
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: text("session_token").notNull().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => [
    {
      userIdIdx: index("session_user_id_idx").on(session.userId),
    },
  ]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => [
    {
      compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    },
  ]
);

export const roleEnum = pgEnum(`${process.env.APP_NAME}_role`, [
  "viewer",
  "contributor",
  "editor",
  "admin",
]);

/**
 * Table to link users to a particular data source role. This will be used to control whether the user can work with a given datasource
 */
export const userDataSourceRole = createTable("user_data_source_role", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: roleEnum().notNull(),
  // data source is implicit in the tracking fields
  ...trackingFields,
});

export const userDataSourceRoleRelations = relations(
  userDataSourceRole,
  ({ one }) => ({
    user: one(users, {
      fields: [userDataSourceRole.userId],
      references: [users.id],
    }),
    dataSource: one(dataSources, {
      fields: [userDataSourceRole.dataSourceId],
      references: [dataSources.id],
    }),
  })
);

export const userTenants = createTable("user_tenant", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  role: roleEnum().notNull(),
  ...trackingFields,
});

export const userTenantsRelations = relations(userTenants, ({ one }) => ({
  user: one(users, { fields: [userTenants.userId], references: [users.id] }),
  tenant: one(tenants, {
    fields: [userTenants.tenantId],
    references: [tenants.id],
  }),
}));
