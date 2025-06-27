import { z } from "zod/v4-mini";

export const zSourceFcPartenaires = z.object({
  Numero_Fiche: z.string(),
  Nom_Partenaire: z.nullable(z.string()),
  Siret_Partenaire: z.nullable(z.string()),
  Habilitation_Partenaire: z.nullable(z.string()),
});

export type ISourceFcPartenaires = z.infer<typeof zSourceFcPartenaires>;
