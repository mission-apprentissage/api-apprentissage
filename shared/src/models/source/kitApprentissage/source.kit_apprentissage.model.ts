import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectId } from "../../common.js";

const collectionName = "source.kit_apprentissage" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ cfd: 1, rncp: 1 }, { unique: true }],
  [{ rncp: 1, cfd: 1 }, {}],
];

export const zKitApprentissage = z.object({
  _id: zObjectId,
  rncp: z.string(),
  cfd: z.string(),
});

export const sourceKitApprentissageModelDescriptor = {
  zod: zKitApprentissage,
  indexes,
  collectionName,
};

export type ISourceKitApprentissage = z.output<typeof zKitApprentissage>;
