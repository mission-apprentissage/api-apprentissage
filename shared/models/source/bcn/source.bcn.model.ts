import { z } from "zod";

import { IModelDescriptor } from "../../common";
import { zBcn_N_FormationDiplome } from "./bcn.n_formation_diplome.model";
import { zBcn_N_NiveauFormationDiplome } from "./bcn.n_niveau_formation_diplome.model";
import { zBcn_N51_FormationDiplome } from "./bcn.n51_formation_diplome.model";
import { zBcn_V_FormationDiplome } from "./bcn.v_formation_diplome.model";

export * from "./bcn.n51_formation_diplome.model";
export * from "./bcn.n_formation_diplome.model";
export * from "./bcn.n_niveau_formation_diplome.model";
export * from "./bcn.v_formation_diplome.model";

const collectionName = "source.bcn" as const;

const indexes: IModelDescriptor["indexes"] = [[{ date: 1, source: 1 }, {}]];

export const zBcn = z.union([
  zBcn_N_FormationDiplome,
  zBcn_N51_FormationDiplome,
  zBcn_N_NiveauFormationDiplome,
  zBcn_V_FormationDiplome,
]);

export const sourceBcnModelDescriptor = {
  zod: zBcn,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;

export const zBcnBySource = {
  N_FORMATION_DIPLOME: zBcn_N_FormationDiplome,
  N_FORMATION_DIPLOME_ENQUETE_51: zBcn_N51_FormationDiplome,
  N_NIVEAU_FORMATION_DIPLOME: zBcn_N_NiveauFormationDiplome,
  V_FORMATION_DIPLOME: zBcn_V_FormationDiplome,
} as const;

export type ISourceBcn = z.output<typeof zBcn>;
