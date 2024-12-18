/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSchema } from "graphql-yoga";
import { db } from "./db";
import * as db_schema from "./db/schema";

import { logger } from "./logger";
import { createBuilder, TableKeys, updateBuilder } from "./model";

import * as validations from "./validations";
import { ADMIN_ROLES } from "./utils/auth";
import { Session, User } from "@auth/express";

export interface GraphQLContext {
  db: typeof db;
  user?: User;
  jwt?: { payload: { _id: string; tenant: string; dataSource: string } };
}

const lookupSettings = {
  columns: {
    id: true,
    name: true,
    active: true,
  },
};

const mutations = {
  createTenant: createBuilder(
    validations.insertTenant,
    "tenants" as TableKeys<typeof db_schema>,
    ADMIN_ROLES
  ),
  createTag: createBuilder(
    validations.insertTag,
    "tags" as TableKeys<typeof db_schema>
  ),
  updateTag: updateBuilder(
    validations.tag,
    "tags" as TableKeys<typeof db_schema>
  ),
  createProduct: createBuilder(
    validations.insertProduct,
    "product" as TableKeys<typeof db_schema>
  ),
  updateProduct: updateBuilder(
    validations.product,
    "product" as TableKeys<typeof db_schema>
  ),
  createProductGroup: createBuilder(
    validations.insertProductGroup,
    "productGroups" as TableKeys<typeof db_schema>
  ),
  updateProductGroup: updateBuilder(
    validations.productGroup,
    "productGroups" as TableKeys<typeof db_schema>
  ),
  createTeamRole: createBuilder(
    validations.insertTeamRole,
    "teamRoles" as TableKeys<typeof db_schema>
  ),
  updateTeamRole: updateBuilder(
    validations.teamRole,
    "teamRoles" as TableKeys<typeof db_schema>
  ),
  createDataSource: createBuilder(
    validations.insertDataSource,
    "dataSources" as TableKeys<typeof db_schema>,
    ADMIN_ROLES
  ),
  updateDataSource: updateBuilder(
    validations.dataSource,
    "dataSources" as TableKeys<typeof db_schema>,
    ADMIN_ROLES
  ),
  createTeam: createBuilder(
    validations.insertTeam,
    "teams" as TableKeys<typeof db_schema>
  ),
  updateTeam: updateBuilder(
    validations.team,
    "teams" as TableKeys<typeof db_schema>
  ),
};

// generate types for all this
Object.entries(mutations).forEach(([key, value]) => {});

export const schema = createSchema<GraphQLContext>({
  typeDefs: /* GraphQL */ `
    interface Identified {
      # The ID of the object.
      id: ID!
    }
    type Lookup implements Identified {
      id: ID!
      name: String!
      active: Boolean!
    }
    type Tag implements Identified {
      id: ID!
      name: String!
      active: Boolean!
    }
    type TeamRole implements Identified {
      id: ID!
      name: String!
      abbr: String!
      active: Boolean!
    }
    type Tenant implements Identified {
      id: ID!
      name: String!
      domain: String!
      active: Boolean!
    }
    type Query {
      hello: String
      tags: [Lookup!]!
      teams: [Lookup!]!
      products: [Lookup!]!
      teamRoles: [Lookup!]!
    }
    type ProductGroup implements Identified {
      id: ID!
      name: String!
      active: Boolean!
    }
    type Product implements Identified {
      id: ID!
      name: String!
      active: Boolean!
      description: String!
      productGroup: String!
    }
    type Mutation {
      createTenant(name: String!, domain: String!, active: Boolean): Tenant!
      createTag(name: String!, active: Boolean): Tag!
      updateTag(id: String!, name: String!, active: Boolean): Tag!
      createProduct(
        name: String!
        description: String!
        productGroup: String!
        active: Boolean
      ): Product!
      updateProduct(
        id: String!
        name: String!
        description: String!
        productGroup: String!
        active: Boolean
      ): Product!
      createProductGroup(name: String!, active: Boolean): ProductGroup!
      updateProductGroup(
        id: String!
        name: String!
        active: Boolean
      ): ProductGroup!
      createTeamRole(name: String!, abbr: String!, active: Boolean): TeamRole!
      updateTeamRole(
        id: String!
        name: String!
        abbr: String!
        active: Boolean
      ): TeamRole!
      createDataSource(name: String!, active: Boolean): Lookup!
      updateDataSource(id: String!, name: String!, active: Boolean): Lookup!
      createTeam(name: String!, active: Boolean): Lookup!
      updateTeam(id: String!, name: String!, active: Boolean): Lookup!
    }
  `,
  resolvers: {
    Query: {
      hello: (_, args, context) =>
        JSON.stringify({
          user: context.jwt.payload._id,
          dataSource: context.jwt.payload.dataSource,
          jwt: context.jwt,
        }),
      tags: (_, _args, context) =>
        context.db.query.tags.findMany(lookupSettings),
      teams: (_, _args, _context) => {
        logger.info("teams", _args, _context);
        return db.query.teams.findMany(lookupSettings);
      },
      products: (_, _args, _context) =>
        db.query.product.findMany(lookupSettings),
      teamRoles: (_, _args, _context) =>
        db.query.teamRoles.findMany(lookupSettings),
    },
    Mutation: mutations,
  },
});
