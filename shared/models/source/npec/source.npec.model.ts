import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from "../../common";

const collectionName = "source.npec" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date_import: 1, filename: 1 }, {}],
  [{ filename: 1, "data.type": 1 }, {}],
];

export const zSourceNpecReferentielData = z
  .object({
    type: z.literal("npec"),
    rncp: z.coerce.string().nullable(),
    formation_libelle: z.coerce.string().nullable(),
    certificateur: z.coerce.string().nullable(),
    diplome_code: z.coerce.string().nullable(),
    diplome_libelle: z.coerce.string().nullable(),
    cpne_code: z.coerce.string().nullable(),
    cpne_libelle: z.coerce.string().nullable(),
    npec: z.coerce.number().nullable(),
    statut: z.coerce.string().nullable(),
    date_applicabilite: z.date().nullable(),
    procedure: z.coerce.number().nullable(),
    idcc: z.coerce.string().nullable(),
  })
  .strict();

export const zSourceNpecIdccCpneData = z
  .object({
    type: z.literal("cpne-idcc"),
    idcc: z.coerce.string().nullable(),
    cpne_code: z.coerce.string().nullable(),
    cpne_libelle: z.coerce.string().nullable(),
  })
  .strict();

export const zSourceNpecData = z.discriminatedUnion("type", [zSourceNpecReferentielData, zSourceNpecIdccCpneData]);

export const zSourceNpecIdcc = z
  .object({
    _id: zObjectId,
    filename: z.string(),
    date_import: z.date(),
    date_file: z.date(),
    data: zSourceNpecData,
  })
  .strict();

export const sourceNpecModelDescriptor = {
  zod: zSourceNpecIdcc,
  indexes,
  collectionName,
};

export type ISourceNpec = z.output<typeof zSourceNpecIdcc>;
export type ISourceNpecReferentielData = z.output<typeof zSourceNpecReferentielData>;
