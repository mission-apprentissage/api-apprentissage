import { z } from "zod";

import { zObjectId } from "../../common";
import { zBcn_V_FormationDiplomeData } from "./bcn.v_formation_diplome.model";

export const zBcn_N51_FormationDiplomeData = zBcn_V_FormationDiplomeData
  .extend({
    N_COMMENTAIRE: z.string().nullable(),
    CITE_DOMAINE_DETAILLE: z.string().nullable(),
    "N_CITE_2013_DOMAINE_DETAILL.LIBELLE_EDITION": z.string().nullable(),
    DIPLOME_SISE: z.string().nullable(),
    "N_DIPLOME_SISE.LIBELLE_INTITULE_1": z.string().nullable(),
    HABILITATION_ORIGINE: z.string().nullable(),
    NUMERO_UAI: z.string().nullable(),
  })
  .strict();

export const zBcn_N51_FormationDiplome = z
  .object({
    _id: zObjectId,
    source: z.literal("N_FORMATION_DIPLOME_ENQUETE_51"),
    date: z.date(),
    data: zBcn_N51_FormationDiplomeData,
  })
  .strict();

export type IBcn_N51_FormationDiplome = z.output<typeof zBcn_N51_FormationDiplome>;
