import { zRncp } from "api-alternance-sdk";
import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from "../../common.js";

const collectionName = "source.npec.normalized" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date_import: 1, filename: 1 }, {}],
  [{ date_import: 1, filename: 1, rncp: 1, cpne_code: 1 }, { unique: true }],
  [{ rncp: 1, idcc: 1, date_file: -1, date_applicabilite: 1 }, {}],
];

export const zSourceNpecNormalizedData = z
  .object({
    _id: zObjectId,
    rncp: zRncp,
    cpne_code: z.string(),
    cpne_libelle: z.string(),
    npec: z.array(z.number()),
    date_applicabilite: z.date(),
    idcc: z.array(z.number()),
    filename: z.string(),
    date_file: z.date(),
    import_id: zObjectId,
    date_import: z.date(),
  })
  .strict();

export const zSourceNpecNormalizedFlatData = zSourceNpecNormalizedData
  .omit({ npec: true })
  .extend({
    npec: z.number(),
  })
  .strict();

export const sourceNpecNormalizedModelDescriptor = {
  zod: zSourceNpecNormalizedData,
  indexes,
  collectionName,
};

export type ISourceNpecNormalized = z.output<typeof zSourceNpecNormalizedData>;
export type ISourceNpecNormalizedFlat = z.output<typeof zSourceNpecNormalizedFlatData>;
