import { z } from "zod";

export const zSourceFcAncienneNouvelle = z
  .object({
    Numero_Fiche: z.string(),
    Ancienne_Certification: z.string().nullable(),
    Nouvelle_Certification: z.string().nullable(),
  })
  .strict();

export type ISourceFcAncienneNouvelle = z.infer<typeof zSourceFcAncienneNouvelle>;
