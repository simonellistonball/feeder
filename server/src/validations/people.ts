import { z } from "zod";

function typedPhone(type: string) {
  return z.object({
    id: z.string().uuid(),
    number: z.string().max(255),
    type: z.literal(type),
  });
}

export const phone = z.object({
  id: z.string().uuid(),
  number: z.string().max(255),
  type: z.enum(["home", "work", "mobile"]),
});

export const address = z.object({
  id: z.string().uuid(),
  street: z.string().max(255),
  city: z.string().max(255),
  stateProvince: z.string().max(255),
  postalCode: z.string().max(255),
  countryRegion: z.string().max(255),
});

export const person = z.object({
  id: z.string().uuid(),
  uid: z.string().max(255).optional(),
  title: z.string().max(50).optional(),

  prefix: z.string().optional(),
  suffix: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  organization: z.string().max(255),
  email: z.string().email().optional(),
  workEmail: z.string().email().optional(),

  homePhone: typedPhone("home").optional(),
  workPhone: typedPhone("work").optional(),
  mobilePhone: typedPhone("mobile").optional(),

  homeAddress: address.optional(),
  workAddress: address.optional(),
  billingAddress: address.optional(),
  shippingAddress: address.optional(),
});
