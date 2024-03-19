import { z } from "zod";

export const zSourceFcCertificateur = z
  .object({
    Numero_Fiche: z.string(),
    Siret_Certificateur: z.string(),
    Nom_Certificateur: z.string(),
  })
  .strict();

export type ISourceFcCertificateur = z.infer<typeof zSourceFcCertificateur>;
