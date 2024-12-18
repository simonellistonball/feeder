import { z } from "zod";
import { namedObject, sanitize } from "./utils";

export const tag = z.object({
  ...namedObject,
  name: z.string().min(1).max(50).transform(sanitize),
});
export const insertTag = tag.omit({ id: true });
