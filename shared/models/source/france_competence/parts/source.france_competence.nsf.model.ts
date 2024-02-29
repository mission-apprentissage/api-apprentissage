import { z } from "zod";

export const zSourceFcNsf = z
  .object({
    Numero_Fiche: z.string(),
    Nsf_Code: z.string().nullable(),
    Nsf_Intitule: z.string().nullable(),
  })
  .strict();

export type ISourceFcNsf = z.infer<typeof zSourceFcNsf>;
