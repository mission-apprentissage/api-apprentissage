import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from "../../common";

const collectionName = "source.dares.ccn" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date_import: 1 }, {}],
  [{ "data.idcc": 1, "data.titre": 1 }, {}],
];

export const zSourceDaresConventionCollectionData = z.object({
  idcc: z.coerce.number(),
  titre: z.string(),
});

export const zSourceDaresCcn = z.object({
  _id: zObjectId,
  import_id: zObjectId,
  date_import: z.date(),
  data: z.object({
    idcc: z.coerce.number(),
    titre: z.string(),
  }),
});

export const sourceDaresCcnModelDescriptor = {
  zod: zSourceDaresCcn,
  indexes,
  collectionName,
};

export type ISourceDaresCcn = z.output<typeof zSourceDaresCcn>;
