import { z } from "zod";
import { namedObject } from "./utils";

export const dataSource = z.object({
  ...namedObject,
});
export const insertDataSource = dataSource.omit({ id: true });
