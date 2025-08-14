import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectIdMini } from "../../common.js";

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
  convention_collective: z.nullable(
    z.object({
      idcc: z.coerce.number(),
      titre: z.string(),
    })
  ),
});

export const zSourceDaresApeIdcc = z.object({
  _id: zObjectIdMini,
  import_id: zObjectIdMini,
  date_import: z.date(),
  data: zSourceDaresApeIdccData,
});

export const sourceDaresApeIdccModelDescriptor = {
  zod: zSourceDaresApeIdcc,
  indexes,
  collectionName,
};

export type ISourceDaresApeIdcc = z.output<typeof zSourceDaresApeIdcc>;
