import { z } from "zod";

export const zSourceFcPartenaires = z
  .object({
    Numero_Fiche: z.string(),
    Nom_Partenaire: z.string().nullable(),
    Siret_Partenaire: z.string().nullable(),
    Habilitation_Partenaire: z.string().nullable(),
  })
  .strict();

export type ISourceFcPartenaires = z.infer<typeof zSourceFcPartenaires>;
