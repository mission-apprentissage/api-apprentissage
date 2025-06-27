import { z } from "zod/v4-mini";

export const zSourceFcNsf = z.object({
  Numero_Fiche: z.string(),
  Nsf_Code: z.string(),
  Nsf_Intitule: z.nullable(z.string()),
});

export type ISourceFcNsf = z.infer<typeof zSourceFcNsf>;
