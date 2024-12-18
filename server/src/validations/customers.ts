import { z } from "zod";
import { namedObject } from "./utils";

export const customer = z.object({
  ...namedObject,
});

export const insertCustomer = customer.omit({ id: true });

export const company = z.object({
  ...namedObject,
  companyAddresses: z
    .array(
      z.object({ companyId: z.string().uuid(), addressId: z.string().uuid() })
    )
    .optional(),
  companyPhones: z
    .array(
      z.object({ companyId: z.string().uuid(), phoneId: z.string().uuid() })
    )
    .optional(),
  companyPeople: z
    .array(
      z.object({ companyId: z.string().uuid(), phoneId: z.string().uuid() })
    )
    .optional(),
});

export const insertCompany = company.omit({ id: true });
