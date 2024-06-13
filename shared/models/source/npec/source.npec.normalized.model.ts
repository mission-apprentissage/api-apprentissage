import { z } from "zod";

import { zRncp } from "../../../zod/certifications.primitives";
import { IModelDescriptor, zObjectId } from "../../common";

const collectionName = "source.npec.normalized" as const;

const indexes: IModelDescriptor["indexes"] = [
  [{ date_import: 1, filename: 1 }, {}],
  [{ date_import: 1, filename: 1, rncp: 1, cpne_code: 1 }, { unique: true }],
];

export const zSourceNpecNormalizedData = z
  .object({
    _id: zObjectId,
    rncp: zRncp,
    cpne_code: z.string(),
    cpne_libelle: z.string(),
    npec: z.array(z.number()),
    date_applicabilite: z.date(),
    idcc: z.array(z.string()),
    filename: z.string(),
    date_file: z.date(),
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
} as const satisfies IModelDescriptor;

export type ISourceNpecNormalized = z.output<typeof zSourceNpecNormalizedData>;
export type ISourceNpecNormalizedFlat = z.output<typeof zSourceNpecNormalizedFlatData>;
