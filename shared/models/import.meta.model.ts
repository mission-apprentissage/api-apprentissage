import { z } from "zod";

import { IModelDescriptor, zObjectId } from "./common";

const collectionName = "import.meta" as const;

const indexes: IModelDescriptor["indexes"] = [[{ type: 1, import_date: 1 }, {}]];

export const zImportMeta = z
  .object({
    _id: zObjectId,
    import_date: z.date(),
    type: z.literal("france_competence"),
  })
  .strict();

export const importMetaModelDescriptor = {
  zod: zImportMeta,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;

export type IImportMeta = z.output<typeof zImportMeta>;
