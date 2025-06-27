import { z } from "zod/v4-mini";

export const zSourceFcCertificateur = z.object({
  Numero_Fiche: z.string(),
  Siret_Certificateur: z.string(),
  Nom_Certificateur: z.string(),
});

export type ISourceFcCertificateur = z.infer<typeof zSourceFcCertificateur>;
