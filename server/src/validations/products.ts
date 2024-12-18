import { z } from "zod";
import { namedObject, sanitizedHtml } from "./utils";

const baseSchema = z.object({
  ...namedObject,
  parentId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  description: z.string().min(20),
});

const sanity = (
  v: z.infer<typeof baseSchema> | Omit<z.infer<typeof baseSchema>, "id">
) => ({
  ...v,
  description: sanitizedHtml(v.description),
});

export const feature = baseSchema.transform(sanity);
export const insertFeature = baseSchema.omit({ id: true }).transform(sanity);

export const productGroup = z.object({
  ...namedObject,
});
export const insertProductGroup = productGroup.omit({ id: true });

export const team = z.object({
  ...namedObject,
});
export const insertTeam = team.omit({ id: true });

export const teamRole = z.object({
  ...namedObject,
  description: z.string().transform(sanitizedHtml),
  abbr: z.string().min(1).max(20),
});
export const insertTeamRole = teamRole.omit({ id: true });

export const product = z.object({
  ...namedObject,
  description: z.string().transform(sanitizedHtml),
  productGroup: z.string().uuid().optional(),
});
export const insertProduct = product.omit({ id: true });
