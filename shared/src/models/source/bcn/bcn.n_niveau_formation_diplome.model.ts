import { z } from "zod/v4-mini";

import { zObjectIdMini } from "../../common.js";

export const zBcn_N_NiveauFormationDiplomeData = z.object({
  NIVEAU_FORMATION_DIPLOME: z.nullable(z.string()),
  LIBELLE_COURT: z.nullable(z.string()),
  DATE_OUVERTURE: z.nullable(z.string()),
  DATE_FERMETURE: z.nullable(z.string()),
  DATE_INTERVENTION: z.nullable(z.string()),
  NIVEAU_QUALIFICATION_RNCP: z.nullable(z.string()),
  N_NIVEAU_QUALIFICATION_RNCP_LIBELLE_LONG: z.nullable(z.string()),
  N_COMMENTAIRE: z.nullable(z.string()),
  NIVEAU_INTERMINISTERIEL: z.string(),
  N_NIVEAU_INTERMINISTERIEL_LIBELLE_LONG: z.nullable(z.string()),
  LIBELLE_100: z.nullable(z.string()),
  ANCIEN_NIVEAU: z.nullable(z.string()),
});

export const zBcn_N_NiveauFormationDiplome = z.object({
  _id: zObjectIdMini,
  source: z.literal("N_NIVEAU_FORMATION_DIPLOME"),
  date: z.date(),
  data: zBcn_N_NiveauFormationDiplomeData,
});

export type IBcn_N_NiveauFormationDiplome = z.output<typeof zBcn_N_NiveauFormationDiplome>;
