import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectIdMini } from "../../common.js";

const collectionName = "source.npec" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date_import: 1, filename: 1 }, {}],
  [{ filename: 1, "data.type": 1 }, {}],
];

export const zSourceNpecReferentielData = z.object({
  type: z.literal("npec"),
  rncp: z.nullable(z.coerce.string()),
  formation_libelle: z.nullable(z.coerce.string()),
  certificateur: z.nullable(z.coerce.string()),
  diplome_code: z.nullable(z.coerce.string()),
  diplome_libelle: z.nullable(z.coerce.string()),
  cpne_code: z.nullable(z.coerce.string()),
  cpne_libelle: z.nullable(z.coerce.string()),
  npec: z.nullable(z.coerce.number()),
  statut: z.nullable(z.coerce.string()),
  date_applicabilite: z.nullable(z.date()),
  procedure: z.nullable(z.coerce.number()),
  idcc: z.nullable(z.coerce.string()),
});

export const zSourceNpecIdccCpneData = z.object({
  type: z.literal("cpne-idcc"),
  idcc: z.nullable(z.coerce.string()),
  cpne_code: z.nullable(z.coerce.string()),
  cpne_libelle: z.nullable(z.coerce.string()),
});

export const zSourceNpecData = z.discriminatedUnion("type", [zSourceNpecReferentielData, zSourceNpecIdccCpneData]);

export const zSourceNpecIdcc = z.object({
  _id: zObjectIdMini,
  filename: z.string(),
  date_import: z.date(),
  date_file: z.date(),
  import_id: zObjectIdMini,
  data: zSourceNpecData,
});

export const sourceNpecModelDescriptor = {
  zod: zSourceNpecIdcc,
  indexes,
  collectionName,
};

export type ISourceNpec = z.output<typeof zSourceNpecIdcc>;
export type ISourceNpecReferentielData = z.output<typeof zSourceNpecReferentielData>;
