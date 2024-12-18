import { z } from "zod";
import stream, { ChangeEvent } from "./stream";
import { checkUser, CREATE_ROLES, UPDATE_ROLES } from "./utils/auth";
import * as schema from "./db/schema";
import { GraphQLContext } from "./schema";
import { YogaInitialContext } from "graphql-yoga";
import { PgTable } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

// Define the required fields
interface BaseFields {
  id: unknown;
  createdAt: Date;
  createdById: string;
  dataSourceId: string;
}

type ValidTable = PgTable & {
  [K in keyof BaseFields]: unknown;
};

// Helper type to get keys of schema that are PgTable instances
export type TableKeys<T> = {
  [K in keyof T]: T[K] extends ValidTable ? K : never;
}[keyof T];

export function createBuilder<
  Z extends z.ZodTypeAny,
  T extends TableKeys<typeof schema>,
>(zodSchema: Z, table: T, roles: string[] = CREATE_ROLES) {
  return async (
    _,
    args: unknown,
    context: GraphQLContext & YogaInitialContext
  ) => {
    // validate the schema
    const data = await zodSchema.transform(stripUndefined).parse(args);
    // check the user has permissions
    const { user, dataSource } = await checkUser(context, roles);

    // find the table and do the work
    const databaseTable = schema[table];
    const newObject = await context.db
      .insert(databaseTable)
      .values({
        ...data,
        createdAt: new Date(),
        createdById: user.id,
        dataSourceId: dataSource,
      })
      .returning();

    // send the change to the stream
    await stream(
      {
        type: "add",
        model: table.toString(),
        key: newObject[0].id,
        value: newObject[0],
      } as ChangeEvent,
      "changes"
    );
    return newObject[0];
  };
}

export function updateBuilder<
  Z extends z.ZodTypeAny,
  T extends TableKeys<typeof schema>,
>(zodSchema: Z, table: T, roles: string[] = UPDATE_ROLES) {
  return async (
    _,
    args: unknown,
    context: GraphQLContext & YogaInitialContext
  ) => {
    // validate the schema
    const data = await zodSchema.transform(stripUndefined).parse(args);
    // check the user has permissions
    const { user, dataSource } = await checkUser(context, roles);

    // find the table and do the work
    const databaseTable = schema[table];

    const oldObject = await context.db
      .select()
      .from(databaseTable)
      .where(eq(databaseTable.id, data.id))
      .limit(1);

    const newObject = await context.db
      .update(databaseTable)
      .set({
        ...data,
        updatedAt: new Date(),
        updatedById: user.id,
        dataSourceId: dataSource,
      })
      .where(eq(databaseTable.id, data.id))
      .returning();

    // send the change to the stream
    await stream(
      {
        type: "update",
        model: table.toString(),
        key: newObject[0].id,
        oldValue: oldObject[0],
        value: newObject[0],
      } as ChangeEvent,
      "changes"
    );
    return newObject[0];
  };
}

export const stripUndefined = <T extends Record<string, unknown>>(obj: T) => {
  const newObj: T = { ...obj };
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};
