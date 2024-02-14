import { z } from "zod";

import { zObjectId } from "../../common";
import { zBcn_V_FormationDiplomeData } from "./bcn.v_formation_diplome.model";

export const zBcn_N_FormationDiplomeData = zBcn_V_FormationDiplomeData
  .extend({
    ANCIEN_DIPLOME_1: z.string().nullable(),
    ANCIEN_DIPLOME_2: z.string().nullable(),
    ANCIEN_DIPLOME_3: z.string().nullable(),
    ANCIEN_DIPLOME_4: z.string().nullable(),
    ANCIEN_DIPLOME_5: z.string().nullable(),
    ANCIEN_DIPLOME_6: z.string().nullable(),
    ANCIEN_DIPLOME_7: z.string().nullable(),
    NOUVEAU_DIPLOME_1: z.string().nullable(),
    NOUVEAU_DIPLOME_2: z.string().nullable(),
    NOUVEAU_DIPLOME_3: z.string().nullable(),
    NOUVEAU_DIPLOME_4: z.string().nullable(),
    NOUVEAU_DIPLOME_5: z.string().nullable(),
    NOUVEAU_DIPLOME_6: z.string().nullable(),
    NOUVEAU_DIPLOME_7: z.string().nullable(),
    NB_MEF_OUVERT: z.string().nullable(),
    NB_MEF_FERME: z.string().nullable(),
    DATE_SESSION_RATTRAPAGE: z.string().nullable(),
    OBSERVATION: z.string().nullable(),
    N_COMMENTAIRE: z.string().nullable(),
    CITE_DOMAINE_DETAILLE: z.string().nullable(),
    "N_CITE_2013_DOMAINE_DETAILL.LIBELLE_EDITION": z.string().nullable(),
  })
  .strict();

export const zBcn_N_FormationDiplome = z
  .object({
    _id: zObjectId,
    source: z.literal("N_FORMATION_DIPLOME"),
    date: z.date(),
    data: zBcn_N_FormationDiplomeData,
  })
  .strict();

export type IBcn_N_FormationDiplome = z.output<typeof zBcn_N_FormationDiplome>;
