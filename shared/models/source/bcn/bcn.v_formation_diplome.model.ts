import { z } from "zod";

import { zObjectId } from "../../common";

export const zBcn_V_FormationDiplomeData = z
  .object({
    FORMATION_DIPLOME: z.string(),
    NIVEAU_FORMATION_DIPLOME: z.string(),
    N_NIVEAU_FORMATION_DIPLOME_LIBELLE_100: z.string().nullable(),
    GROUPE_SPECIALITE: z.string(),
    N_GROUPE_SPECIALITE_LIBELLE_LONG: z.string().nullable(),
    LETTRE_SPECIALITE: z.string().nullable(),
    N_LETTRE_SPECIALITE_LIBELLE_LONG: z.string().nullable(),
    ANCIEN_RECME: z.string().nullable(),
    LIBELLE_COURT: z.string(),
    LIBELLE_STAT_33: z.string(),
    LIBELLE_LONG_200: z.string(),
    DATE_OUVERTURE: z.string().nullable(),
    DATE_FERMETURE: z.string().nullable(),
    UNITE_CAPITALISABLE: z.string().nullable(),
    DATE_PREMIERE_SESSION: z.string().nullable(),
    DATE_DERNIERE_SESSION: z.string().nullable(),
    DATE_ARRETE_CREATION: z.string().nullable(),
    DATE_ARRETE_ABROGATION: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_1: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_2: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_3: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_4: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_5: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_6: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_7: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_8: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_9: z.string().nullable(),
    DATE_ARRETE_MODIFICATION_10: z.string().nullable(),
    COMMENTAIRE: z.string().nullable(),
    NATURE_FORMATION_DIPLOME: z.string().nullable(),
    N_NATURE_FORMATION_DIPLOME_LIBELLE_100: z.string().nullable(),
    GESTIONNAIRE_FORMATION_DIPLOME: z.string().nullable(),
    DATE_INTERVENTION: z.string().nullable(),
    ID_DOCUMENT: z.string().nullable(),
    CITE_DOMAINE_FORMATION: z.string().nullable(),
    N_CITE_DOMAINE_FORMATION_LIBELLE_EDITION: z.string().nullable(),
    NIVEAU_QUALIFICATION_RNCP: z.string().nullable(),
    N_NIVEAU_QUALIFICATION_RNCP_LIBELLE_LONG: z.string().nullable(),
  })
  .strict();

export const zBcn_V_FormationDiplome = z
  .object({
    _id: zObjectId,
    source: z.literal("V_FORMATION_DIPLOME"),
    date: z.date(),
    data: zBcn_V_FormationDiplomeData,
  })
  .strict();

export type IBcn_V_FormationDiplome = z.output<typeof zBcn_V_FormationDiplome>;
