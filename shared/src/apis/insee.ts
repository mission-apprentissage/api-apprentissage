import { z } from "zod/v4-mini";

export const zInseeItem = z.object({
  code: z.string(),
  intitule: z.string(),
});

export type IInseeItem = z.infer<typeof zInseeItem>;
