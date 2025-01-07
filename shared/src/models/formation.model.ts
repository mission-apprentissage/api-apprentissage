import { zFormation } from "api-alternance-sdk";
import { z } from "zod";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectId } from "./common.js";

const collectionName = "formation" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ "identifiant.cle_ministere_educatif": 1 }, { unique: true }]];

export const zFormationInternal = zFormation.extend({
  _id: zObjectId,
  created_at: z.date(),
  updated_at: z.date(),
});

export type IFormationInternal = z.output<typeof zFormationInternal>;

export const formationModelDescriptor = {
  zod: zFormationInternal,
  indexes,
  collectionName,
};
