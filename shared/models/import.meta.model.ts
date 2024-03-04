import { z } from "zod";

import { zDataGouvDatasetResource } from "../apis";
import { IModelDescriptor, zObjectId } from "./common";

const collectionName = "import.meta" as const;

const indexes: IModelDescriptor["indexes"] = [[{ type: 1, import_date: 1 }, {}]];

export const zArchiveMeta = z.object({
  date_publication: z.date(),
  last_updated: z.date(),
  nom: z.string(),
  resource: zDataGouvDatasetResource.extend({
    created_at: z.date(),
    last_modified: z.date(),
  }),
});

export type IArchiveMeta = z.output<typeof zArchiveMeta>;

export const zImportMeta = z
  .object({
    _id: zObjectId,
    import_date: z.date(),
    type: z.literal("france_competence"),
    archiveMeta: zArchiveMeta,
  })
  .strict();

export const importMetaModelDescriptor = {
  zod: zImportMeta,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;

export type IImportMeta = z.output<typeof zImportMeta>;
