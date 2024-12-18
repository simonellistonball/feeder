// mutations.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createYoga } from "graphql-yoga";
import { schema } from "../schema";

import { drizzle } from "drizzle-orm/node-postgres";
import * as db_schema from "../db/schema";
import { ChangeEvent } from "../stream";

const db = drizzle.mock({ schema: db_schema });

vi.mock(import("../utils/auth"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    stream: {
      default: vi
        .fn()
        .mockImplementation((changeEvent: ChangeEvent, topic: string) => {
          return Promise.resolve();
        }),
    },
    checkUser: vi.fn().mockImplementation((context) => {
      if (!context.jwt?.payload?._id) {
        throw new Error("Unauthorized");
      }
      return {
        user: { id: context.jwt.payload._id },
        dataSource: { id: context.jwt.payload.dataSource },
      };
    }),
  };
});

describe("GraphQL Mutations", () => {
  let yoga;
  let testContext;

  beforeEach(() => {
    // Mock database using Drizzle-style structure

    testContext = {
      db,
      jwt: {
        payload: {
          _id: "test-user",
          tenant: "test-tenant",
          dataSource: "test-datasource",
        },
      },
    };

    yoga = createYoga({ schema, context: () => testContext });
  });

  // Update the test assertions to match Drizzle's query builder pattern
  describe("Tenant Mutations", () => {
    it("should create a tenant", async () => {
      const mutation = `
        mutation {
          createTenant(name: "Test Tenant", domain: "test.com", active: true) {
            id
            name
            domain
            active
          }
        }
      `;

      const response = await yoga.fetch("http://yoga/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation }),
      });

      const result = await response.json();
      expect(result.errors).toBeUndefined();
      expect(testContext.db.tenant.insert).toHaveBeenCalled();
      expect(testContext.db.tenant.values).toHaveBeenCalledWith({
        name: "Test Tenant",
        domain: "test.com",
        active: true,
      });
      expect(testContext.db.tenant.execute).toHaveBeenCalled();
    });
  });

  // Update other test assertions similarly...
});
