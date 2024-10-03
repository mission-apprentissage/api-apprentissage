import { zCommune } from "api-alternance-sdk";
import { z } from "zod";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectId } from "./common.js";

const collectionName = "commune" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ codeInsee: 1 }, { unique: true }]];

export const zCommuneInternal = zCommune.extend({
  _id: zObjectId,
  created_at: z.date(),
  updated_at: z.date(),
});

export type ICommuneInternal = z.output<typeof zCommuneInternal>;

export const communeModelDescriptor = {
  zod: zCommuneInternal,
  indexes,
  collectionName,
};
