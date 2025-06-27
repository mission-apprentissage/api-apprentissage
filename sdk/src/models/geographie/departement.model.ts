import { z } from "zod/v4-mini";

export const zDepartement = z.object({
  nom: z.string(),
  codeInsee: z.string(),
  region: z.object({
    codeInsee: z.string(),
    nom: z.string(),
  }),
  academie: z.object({
    id: z.string(),
    code: z.string(),
    nom: z.string(),
  }),
});

export type IDepartement = z.infer<typeof zDepartement>;
