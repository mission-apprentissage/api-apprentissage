import { z } from "zod";

export const zRegion = z.object({
  nom: z.string(),
  codeInsee: z.string(),
  departements: z.array(
    z.object({
      codeInsee: z.string(),
      nom: z.string(),
    })
  ),
});

export type IRegion = z.infer<typeof zRegion>;
