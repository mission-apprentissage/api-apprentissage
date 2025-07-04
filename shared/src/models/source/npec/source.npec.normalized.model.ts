import { zRncp } from "api-alternance-sdk/internal";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectId } from "../../common.js";

const collectionName = "source.npec.normalized" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ import_id: 1 }, {}],
  [{ date_import: 1, filename: 1 }, {}],
  [{ date_import: 1, filename: 1, rncp: 1, cpne_code: 1 }, { unique: true }],
  [{ rncp: 1, idcc: 1, date_file: -1, date_applicabilite: 1 }, {}],
];

export const zSourceNpecNormalizedData = z.object({
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
});

export const zSourceNpecNormalizedFlatData = z.extend(z.omit(zSourceNpecNormalizedData, { npec: true }), {
  npec: z.number(),
});

export const sourceNpecNormalizedModelDescriptor = {
  zod: zSourceNpecNormalizedData,
  indexes,
  collectionName,
};

export type ISourceNpecNormalized = z.output<typeof zSourceNpecNormalizedData>;
export type ISourceNpecNormalizedFlat = z.output<typeof zSourceNpecNormalizedFlatData>;
