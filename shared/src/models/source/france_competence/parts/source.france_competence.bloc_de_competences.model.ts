import { z } from "zod/v4-mini";

export const zSourceFcBlocDeCompetences = z.object({
  Numero_Fiche: z.string(),
  Bloc_Competences_Code: z.string(),
  Bloc_Competences_Libelle: z.nullable(z.string()),
});

export type ISourceFcBlocDeCompetences = z.infer<typeof zSourceFcBlocDeCompetences>;
