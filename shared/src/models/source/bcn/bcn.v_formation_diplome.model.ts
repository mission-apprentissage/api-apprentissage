import { z } from "zod/v4-mini";

import { zObjectIdMini } from "../../common.js";

export const zBcn_V_FormationDiplomeData = z.object({
  FORMATION_DIPLOME: z.string(),
  NIVEAU_FORMATION_DIPLOME: z.string(),
  N_NIVEAU_FORMATION_DIPLOME_LIBELLE_100: z.nullable(z.string()),
  GROUPE_SPECIALITE: z.string(),
  N_GROUPE_SPECIALITE_LIBELLE_LONG: z.nullable(z.string()),
  LETTRE_SPECIALITE: z.nullable(z.string()),
  N_LETTRE_SPECIALITE_LIBELLE_LONG: z.nullable(z.string()),
  ANCIEN_RECME: z.nullable(z.string()),
  LIBELLE_COURT: z.string(),
  LIBELLE_STAT_33: z.string(),
  LIBELLE_LONG_200: z.string(),
  DATE_OUVERTURE: z.nullable(z.string()),
  DATE_FERMETURE: z.nullable(z.string()),
  UNITE_CAPITALISABLE: z.nullable(z.string()),
  DATE_PREMIERE_SESSION: z.nullable(z.string()),
  DATE_DERNIERE_SESSION: z.nullable(z.string()),
  DATE_ARRETE_CREATION: z.nullable(z.string()),
  DATE_ARRETE_ABROGATION: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_1: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_2: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_3: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_4: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_5: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_6: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_7: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_8: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_9: z.nullable(z.string()),
  DATE_ARRETE_MODIFICATION_10: z.nullable(z.string()),
  COMMENTAIRE: z.nullable(z.string()),
  NATURE_FORMATION_DIPLOME: z.nullable(z.string()),
  N_NATURE_FORMATION_DIPLOME_LIBELLE_100: z.nullable(z.string()),
  GESTIONNAIRE_FORMATION_DIPLOME: z.nullable(z.string()),
  DATE_INTERVENTION: z.nullable(z.string()),
  ID_DOCUMENT: z.nullable(z.string()),
  CITE_DOMAINE_FORMATION: z.nullable(z.string()),
  N_CITE_DOMAINE_FORMATION_LIBELLE_EDITION: z.nullable(z.string()),
  NIVEAU_QUALIFICATION_RNCP: z.nullable(z.string()),
  N_NIVEAU_QUALIFICATION_RNCP_LIBELLE_LONG: z.nullable(z.string()),
});

export const zBcn_V_FormationDiplome = z.object({
  _id: zObjectIdMini,
  source: z.literal("V_FORMATION_DIPLOME"),
  date: z.date(),
  data: zBcn_V_FormationDiplomeData,
});

export type IBcn_V_FormationDiplome = z.output<typeof zBcn_V_FormationDiplome>;
