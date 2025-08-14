import { z } from "zod/v4-mini";

import { zObjectIdMini } from "../../common.js";
import { zBcn_V_FormationDiplomeData } from "./bcn.v_formation_diplome.model.js";

export const zBcn_N51_FormationDiplomeData = z.extend(zBcn_V_FormationDiplomeData, {
  N_COMMENTAIRE: z.nullable(z.string()),
  CITE_DOMAINE_DETAILLE: z.nullable(z.string()),
  N_CITE_2013_DOMAINE_DETAILL_LIBELLE_EDITION: z.nullable(z.string()),
  DIPLOME_SISE: z.nullable(z.string()),
  N_DIPLOME_SISE_LIBELLE_INTITULE_1: z.nullable(z.string()),
  HABILITATION_ORIGINE: z.nullable(z.string()),
  NUMERO_UAI: z.nullable(z.string()),
});

export const zBcn_N51_FormationDiplome = z.object({
  _id: zObjectIdMini,
  source: z.literal("N_FORMATION_DIPLOME_ENQUETE_51"),
  date: z.date(),
  data: zBcn_N51_FormationDiplomeData,
});

export type IBcn_N51_FormationDiplome = z.output<typeof zBcn_N51_FormationDiplome>;
