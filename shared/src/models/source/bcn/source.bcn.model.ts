import { z } from "zod";

import { IModelDescriptorGeneric } from '../../common.js';
import { zBcn_N_FormationDiplome } from './bcn.n_formation_diplome.model.js';
import { zBcn_N_NiveauFormationDiplome } from './bcn.n_niveau_formation_diplome.model.js';
import { zBcn_N51_FormationDiplome } from './bcn.n51_formation_diplome.model.js';
import { zBcn_V_FormationDiplome } from './bcn.v_formation_diplome.model.js';

export * from './bcn.n51_formation_diplome.model.js';
export * from './bcn.n_formation_diplome.model.js';
export * from './bcn.n_niveau_formation_diplome.model.js';
export * from './bcn.v_formation_diplome.model.js';

const collectionName = "source.bcn" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date: 1, source: 1 }, {}],
  [{ "data.FORMATION_DIPLOME": 1, source: 1 }, {}],
  [{ source: 1, "data.FORMATION_DIPLOME": 1 }, {}],
];

export const zBcn = z.discriminatedUnion("source", [
  zBcn_N_FormationDiplome,
  zBcn_N51_FormationDiplome,
  zBcn_N_NiveauFormationDiplome,
  zBcn_V_FormationDiplome,
]);

export const sourceBcnModelDescriptor = {
  zod: zBcn,
  indexes,
  collectionName,
};

export const zBcnBySource = {
  N_FORMATION_DIPLOME: zBcn_N_FormationDiplome,
  N_FORMATION_DIPLOME_ENQUETE_51: zBcn_N51_FormationDiplome,
  N_NIVEAU_FORMATION_DIPLOME: zBcn_N_NiveauFormationDiplome,
  V_FORMATION_DIPLOME: zBcn_V_FormationDiplome,
} as const;

export type ISourceBcn = z.output<typeof zBcn>;
