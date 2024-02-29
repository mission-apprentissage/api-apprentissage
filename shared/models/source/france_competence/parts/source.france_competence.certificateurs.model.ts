import { z } from "zod";

export const zSourceFcCertificateur = z
  .object({
    Numero_Fiche: z.string(),
    Siret_Certificateur: z.string().nullable(),
    Nom_Certificateur: z.string().nullable(),
  })
  .strict();

export type ISourceFcCertificateur = z.infer<typeof zSourceFcCertificateur>;
