import { z } from "zod";
import { namedObject } from "./utils";

export const user = z.object({
  ...namedObject,
  email: z.string().email(),
  emailVerified: z.date().optional(),
  image: z.string().url().optional(),
  source: z.string().optional(),
});

export const insertUser = user.omit({ id: true });

export const userTenant = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: z.enum(["viewer", "contributor", "editor", "admin"]),
});
export const userDatasource = z.object({
  userId: z.string().uuid(),
  dataSourceId: z.string().uuid(),
  role: z.enum(["viewer", "contributor", "editor", "admin"]),
});

export const tenant = z.object({
  ...namedObject,
  domain: z.string().max(255),
});
export const insertTenant = tenant.omit({ id: true });
