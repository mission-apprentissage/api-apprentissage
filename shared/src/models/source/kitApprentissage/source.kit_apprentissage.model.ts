import { z } from "zod";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectId } from "../../common.js";

const collectionName = "source.kit_apprentissage" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ cfd: 1, rncp: 1 }, { unique: true }],
  [{ rncp: 1, cfd: 1 }, {}],
];

export const zKitApprentissage = z.object({
  _id: zObjectId,
  rncp: z.string().nullable(),
  cfd: z
    .string()
    .transform((value) => {
      if (["SQWQ", "NR"].includes(value.trim())) return null;
      return value.trim().padStart(8, "0");
    })
    .nullable(),
});

export const sourceKitApprentissageModelDescriptor = {
  zod: zKitApprentissage,
  indexes,
  collectionName,
};

export type ISourceKitApprentissage = z.output<typeof zKitApprentissage>;
