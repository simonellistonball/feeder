import { index, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createTable, namedObject, trackingFields } from "../utils";
import { product, teams } from "./products";
import { companies, customers } from "./customers";
import { feedback } from "./feedback";
import { people } from "./people";
import { relations } from "drizzle-orm";

export const tags = createTable("tags", {
  ...namedObject,
  ...trackingFields,
});

export const productTags = createTable(
  "product_tags",
  {
    tagId: uuid("tag_id").references(() => tags.id),
    productId: uuid("product_id").references(() => product.id),
    ...trackingFields,
  },
  (productTags) => [
    {
      compoundKey: primaryKey({
        columns: [productTags.tagId, productTags.productId],
      }),
      userIdIdx: index("product_tags_product_id").on(productTags.productId),
    },
  ]
);

export const customerTags = createTable(
  "customer_tags",
  {
    tagId: uuid("tag_id").references(() => tags.id),
    customerId: uuid("customer_id").references(() => customers.id),
    ...trackingFields,
  },
  (customerTags) => [
    {
      compoundKey: primaryKey({
        columns: [customerTags.tagId, customerTags.customerId],
      }),
    },
  ]
);

export const feedbackTags = createTable(
  "feedback_tags",
  {
    tagId: uuid("tag_id").references(() => tags.id),
    feedbackId: uuid("feedback_id").references(() => feedback.id),
    ...trackingFields,
  },
  (feedbackTags) => [
    {
      compoundKey: primaryKey({
        columns: [feedbackTags.tagId, feedbackTags.feedbackId],
      }),
    },
  ]
);

export const peopleTags = createTable(
  "people_tags",
  {
    tagId: uuid("tag_id").references(() => tags.id),
    userId: uuid("user_id").references(() => people.id),
    ...trackingFields,
  },
  (peopleTags) => [
    {
      compoundKey: primaryKey({
        columns: [peopleTags.tagId, peopleTags.userId],
      }),
    },
  ]
);

export const companiesTags = createTable(
  "companies_tags",
  {
    tagId: uuid("tag_id").references(() => tags.id),
    companyId: uuid("company_id").references(() => companies.id),
    ...trackingFields,
  },
  (companiesTags) => [
    {
      compoundKey: primaryKey({
        columns: [companiesTags.tagId, companiesTags.companyId],
      }),
    },
  ]
);

export const teamsTags = createTable(
  "teams_tags",
  {
    tagId: uuid("tag_id").references(() => tags.id),
    teamId: uuid("team_id").references(() => teams.id),
    ...trackingFields,
  },
  (teamsTags) => [
    {
      compoundKey: primaryKey({
        columns: [teamsTags.tagId, teamsTags.teamId],
      }),
    },
  ]
);

export const tagsRelations = relations(tags, ({ many }) => ({
  productTags: many(productTags),
  customerTags: many(customerTags),
  feedbackTags: many(feedbackTags),
  peopleTags: many(peopleTags),
  companiesTags: many(companiesTags),
  teamsTags: many(teamsTags),
}));
