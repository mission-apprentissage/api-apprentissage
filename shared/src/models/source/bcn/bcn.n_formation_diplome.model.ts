import { z } from "zod/v4-mini";

import { zObjectIdMini } from "../../common.js";
import { zBcn_V_FormationDiplomeData } from "./bcn.v_formation_diplome.model.js";

export const zBcn_N_FormationDiplomeData = z.extend(zBcn_V_FormationDiplomeData, {
  ANCIEN_DIPLOMES: z.array(z.string()),
  NOUVEAU_DIPLOMES: z.array(z.string()),
  NB_MEF_OUVERT: z.nullable(z.string()),
  NB_MEF_FERME: z.nullable(z.string()),
  DATE_SESSION_RATTRAPAGE: z.nullable(z.string()),
  OBSERVATION: z.nullable(z.string()),
  N_COMMENTAIRE: z.nullable(z.string()),
  CITE_DOMAINE_DETAILLE: z.nullable(z.string()),
  N_CITE_2013_DOMAINE_DETAILL_LIBELLE_EDITION: z.nullable(z.string()),
});

export const zBcn_N_FormationDiplome = z.object({
  _id: zObjectIdMini,
  source: z.literal("N_FORMATION_DIPLOME"),
  date: z.date(),
  data: zBcn_N_FormationDiplomeData,
});

export type IBcn_N_FormationDiplome = z.output<typeof zBcn_N_FormationDiplome>;
