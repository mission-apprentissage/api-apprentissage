import { z } from "zod";

export const ZAcceZone = z
  .object({
    type_zone_uai: z.string().optional(),
    type_zone_uai_libe: z.string().optional(),
    zone: z.string().optional(), // CODE POSTAL OU UAI
    zone_libe: z.string().optional(),
    date_ouverture: z.string().optional(),
    date_fermeture: z.string().optional(),
    date_derniere_mise_a_jour: z.string().optional(),
  })
  .strict();

export type IAcceZone = z.output<typeof ZAcceZone>;
