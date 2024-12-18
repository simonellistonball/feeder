import { z } from "zod";
import { namedObject, sanitize, sanitizedHtml } from "./utils";

const baseSchema = z.object({
  ...namedObject,
  content: z.string(),
  summary: z.string().optional(),
});

const sanity = (
  v: z.infer<typeof baseSchema> | Omit<z.infer<typeof baseSchema>, "id">
) => ({
  ...v,
  content: sanitizedHtml(v.content),
  summary: v.summary ? sanitize(v.summary) : undefined,
});

export const feedback = baseSchema.transform(sanity);
export const insertFeedback = baseSchema.omit({ id: true }).transform(sanity);
