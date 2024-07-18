import { z } from "zod";

export type Config = Readonly<{
  elementsToRead: readonly string[];
  behaviour: "readAll" | "pickOne";
}>;

export const configSchema = z.object({
  elementsToRead: z.array(z.string()),
  behaviour: z.union([z.literal("readAll"), z.literal("pickOne")]),
});
