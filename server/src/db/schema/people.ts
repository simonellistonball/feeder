import { index, uuid, varchar } from "drizzle-orm/pg-core";
import { createTable, trackingFields } from "../utils";
import { relations } from "drizzle-orm";

export const addresses = createTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    street: varchar("street").notNull(),
    city: varchar("city").notNull(),
    stateProvince: varchar("state").notNull(),
    postalCode: varchar("zip").notNull(),
    countryRegion: varchar("country").notNull(),
    ...trackingFields,
  },
  (t) => [
    index(`${process.env.APP_NAME}_idx_addresses_postalCode`).on(t.postalCode),
    index(`${process.env.APP_NAME}_idx_addresses_city`).on(t.city),
  ]
);

export const phoneNumbers = createTable("phone_numbers", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: varchar("number").notNull(),
  type: varchar("type").notNull(),
  ...trackingFields,
});

export const people = createTable(
  "people",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uid: varchar("uid", { length: 255 }),
    title: varchar("title"),
    prefix: varchar("prefix"),
    suffix: varchar("suffix"),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    organization: varchar("organization", { length: 255 }),

    email: varchar("email"),
    workEmail: varchar("email_work"),

    homePhone: uuid().references(() => phoneNumbers.id),
    workPhone: uuid().references(() => phoneNumbers.id),
    mobilePhone: uuid().references(() => phoneNumbers.id),

    homeAddress: uuid().references(() => addresses.id),
    workAddress: uuid().references(() => addresses.id),
    billingAddress: uuid().references(() => addresses.id),
    shippingAddress: uuid().references(() => addresses.id),

    ...trackingFields,
  },
  (t) => [
    index(`${process.env.APP_NAME}_idx_people_email`).on(t.email),
    index(`${process.env.APP_NAME}_idx_people_workEmail`).on(t.workEmail),
  ]
);

export const peopleRelations = relations(people, ({ one }) => ({
  homePhone: one(phoneNumbers, {
    fields: [people.homePhone],
    references: [phoneNumbers.id],
  }),
  workPhone: one(phoneNumbers, {
    fields: [people.workPhone],
    references: [phoneNumbers.id],
  }),
  mobilePhone: one(phoneNumbers, {
    fields: [people.mobilePhone],
    references: [phoneNumbers.id],
  }),
  homeAddress: one(addresses, {
    fields: [people.homeAddress],
    references: [addresses.id],
  }),
  workAddress: one(addresses, {
    fields: [people.workAddress],
    references: [addresses.id],
  }),
  billingAddress: one(addresses, {
    fields: [people.billingAddress],
    references: [addresses.id],
  }),
  shippingAddress: one(addresses, {
    fields: [people.shippingAddress],
    references: [addresses.id],
  }),
}));
