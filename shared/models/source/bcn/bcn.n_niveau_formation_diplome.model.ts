import { z } from "zod";

import { zObjectId } from "../../common";

export const zBcn_N_NiveauFormationDiplomeData = z
  .object({
    NIVEAU_FORMATION_DIPLOME: z.string().nullable(),
    LIBELLE_COURT: z.string().nullable(),
    DATE_OUVERTURE: z.string().nullable(),
    DATE_FERMETURE: z.string().nullable(),
    DATE_INTERVENTION: z.string().nullable(),
    NIVEAU_QUALIFICATION_RNCP: z.string().nullable(),
    N_NIVEAU_QUALIFICATION_RNCP_LIBELLE_LONG: z.string().nullable(),
    N_COMMENTAIRE: z.string().nullable(),
    NIVEAU_INTERMINISTERIEL: z.string().nullable(),
    N_NIVEAU_INTERMINISTERIEL_LIBELLE_LONG: z.string().nullable(),
    LIBELLE_100: z.string().nullable(),
    ANCIEN_NIVEAU: z.string().nullable(),
  })
  .strict();

export const zBcn_N_NiveauFormationDiplome = z
  .object({
    _id: zObjectId,
    source: z.literal("N_NIVEAU_FORMATION_DIPLOME"),
    date: z.date(),
    data: zBcn_N_NiveauFormationDiplomeData,
  })
  .strict();

export type IBcn_N_NiveauFormationDiplome = z.output<typeof zBcn_N_NiveauFormationDiplome>;
