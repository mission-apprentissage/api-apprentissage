import { z } from "zod";

export const zDepartement = z.object({
  nom: z.string(),
  codeInsee: z.string(),
  region: z.object({
    codeInsee: z.string(),
    nom: z.string(),
  }),
});

export type IDepartement = z.infer<typeof zDepartement>;