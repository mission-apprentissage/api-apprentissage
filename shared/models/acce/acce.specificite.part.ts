import { z } from "zod";

export const ZAcceSpecificite = z
  .object({
    specificite_uai: z.string().optional(),
    specificite_uai_libe: z.string().optional(),
    date_ouverture: z.string().optional(),
    date_fermeture: z.string().optional(),
  })
  .strict();

export type IAcceSpecificite = z.output<typeof ZAcceSpecificite>;
