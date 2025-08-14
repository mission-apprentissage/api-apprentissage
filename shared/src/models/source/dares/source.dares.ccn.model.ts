import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectIdMini } from "../../common.js";

const collectionName = "source.dares.ccn" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date_import: 1 }, {}],
  [{ "data.idcc": 1, date_import: -1, "data.titre": 1 }, {}],
];

export const zSourceDaresConventionCollectionData = z.object({
  idcc: z.coerce.number(),
  titre: z.string(),
});

export const zSourceDaresCcn = z.object({
  _id: zObjectIdMini,
  import_id: zObjectIdMini,
  date_import: z.date(),
  data: zSourceDaresConventionCollectionData,
});

export const sourceDaresCcnModelDescriptor = {
  zod: zSourceDaresCcn,
  indexes,
  collectionName,
};

export type ISourceDaresCcn = z.output<typeof zSourceDaresCcn>;
