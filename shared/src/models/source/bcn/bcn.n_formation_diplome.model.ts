import { z } from "zod";

import { zObjectId } from "../../common.js";
import { zBcn_V_FormationDiplomeData } from "./bcn.v_formation_diplome.model.js";

export const zBcn_N_FormationDiplomeData = zBcn_V_FormationDiplomeData
  .extend({
    ANCIEN_DIPLOMES: z.array(z.string()),
    NOUVEAU_DIPLOMES: z.array(z.string()),
    NB_MEF_OUVERT: z.string().nullable(),
    NB_MEF_FERME: z.string().nullable(),
    DATE_SESSION_RATTRAPAGE: z.string().nullable(),
    OBSERVATION: z.string().nullable(),
    N_COMMENTAIRE: z.string().nullable(),
    CITE_DOMAINE_DETAILLE: z.string().nullable(),
    N_CITE_2013_DOMAINE_DETAILL_LIBELLE_EDITION: z.string().nullable(),
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
