import { z } from "zod";

export const zSourceFcBlocDeCompetences = z
  .object({
    Numero_Fiche: z.string(),
    Bloc_Competences_Code: z.string(),
    Bloc_Competences_Libelle: z.string().nullable(),
  })
  .strict();

export type ISourceFcBlocDeCompetences = z.infer<typeof zSourceFcBlocDeCompetences>;
