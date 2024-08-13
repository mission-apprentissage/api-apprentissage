import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from '../../common.js';

const collectionName = "source.dares.ape_idcc" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date_import: 1 }, {}],
  [{ "data.convention_collective.idcc": 1, date_import: -1, "data.convention_collective.titre": 1 }, {}],
];

export const zSourceDaresApeIdccData = z.object({
  naf: z.object({
    code: z.string(),
    intitule: z.string(),
  }),
  convention_collective: z
    .object({
      idcc: z.coerce.number(),
      titre: z.string(),
    })
    .nullable(),
});

export const zSourceDaresApeIdcc = z.object({
  _id: zObjectId,
  import_id: zObjectId,
  date_import: z.date(),
  data: zSourceDaresApeIdccData,
});

export const sourceDaresApeIdccModelDescriptor = {
  zod: zSourceDaresApeIdcc,
  indexes,
  collectionName,
};

export type ISourceDaresApeIdcc = z.output<typeof zSourceDaresApeIdcc>;
