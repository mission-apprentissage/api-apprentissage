import { z } from "zod";

export const zInseeItem = z.object({
  code: z.string(),
  intitule: z.string(),
});

export type IInseeItem = z.infer<typeof zInseeItem>;
