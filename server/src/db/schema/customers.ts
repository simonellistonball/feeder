import { createTable, namedObject, trackingFields } from "../utils";
import { primaryKey, uuid } from "drizzle-orm/pg-core";
import { addresses, people, phoneNumbers } from "./people";
import { relations } from "drizzle-orm";

export const customers = createTable("customers", {
  ...namedObject,
  ...trackingFields,
});

export const customerPeople = createTable("customers_people", {
  customerId: uuid()
    .notNull()
    .references(() => customers.id),
  peopleId: uuid()
    .notNull()
    .references(() => people.id),
  ...trackingFields,
});

export const companies = createTable("companies", {
  ...namedObject,
  ...trackingFields,
});

// link people, addresses. phones and emails to companies
export const companyPeople = createTable(
  "company_people",
  {
    companyId: uuid()
      .notNull()
      .references(() => companies.id),
    peopleId: uuid()
      .notNull()
      .references(() => people.id),
    ...trackingFields,
  },
  (companyPeople) => [
    {
      compoundKey: primaryKey({
        columns: [companyPeople.peopleId, companyPeople.companyId],
      }),
    },
  ]
);

export const companyAddresses = createTable("company_addresses", {
  companyId: uuid()
    .notNull()
    .references(() => companies.id),
  addressId: uuid()
    .notNull()
    .references(() => addresses.id),
  ...trackingFields,
});

export const companyPhones = createTable(
  "company_phones",
  {
    companyId: uuid()
      .notNull()
      .references(() => companies.id),
    phoneId: uuid()
      .notNull()
      .references(() => phoneNumbers.id),
    ...trackingFields,
  },
  (companyPhones) => [
    {
      compoundKey: primaryKey({
        columns: [companyPhones.phoneId, companyPhones.companyId],
      }),
    },
  ]
);

export const companyRelations = relations(companies, ({ many }) => ({
  companyAddresses: many(companyAddresses),
  companyPhones: many(companyPhones),
  companyPeople: many(companyPeople),
}));

export const companyAddressesRelations = relations(
  companyAddresses,
  ({ one }) => ({
    company: one(companies, {
      fields: [companyAddresses.companyId],
      references: [companies.id],
    }),
    address: one(addresses, {
      fields: [companyAddresses.addressId],
      references: [addresses.id],
    }),
  })
);

export const companyPeopleRelations = relations(companyPeople, ({ one }) => ({
  company: one(companies, {
    fields: [companyPeople.companyId],
    references: [companies.id],
  }),
  people: one(people, {
    fields: [companyPeople.peopleId],
    references: [people.id],
  }),
}));

export const companyPhonesRelations = relations(companyPhones, ({ one }) => ({
  company: one(companies, {
    fields: [companyPhones.companyId],
    references: [companies.id],
  }),
  phone: one(phoneNumbers, {
    fields: [companyPhones.phoneId],
    references: [phoneNumbers.id],
  }),
}));

export const adddressReferences = relations(addresses, ({ many }) => ({
  companyAddresses: many(companyAddresses),
  companyPhones: many(companyPhones),
  companyPeople: many(companyPeople),
}));
