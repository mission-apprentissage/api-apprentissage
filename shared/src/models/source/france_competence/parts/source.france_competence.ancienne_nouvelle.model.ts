import { z } from "zod/v4-mini";

export const zSourceFcAncienneNouvelle = z.object({
  Numero_Fiche: z.string(),
  Ancienne_Certification: z.nullable(z.string()),
  Nouvelle_Certification: z.nullable(z.string()),
});

export type ISourceFcAncienneNouvelle = z.infer<typeof zSourceFcAncienneNouvelle>;
