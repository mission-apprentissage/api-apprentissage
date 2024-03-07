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

export const zImportMetaFranceCompetence = z
  .object({
    _id: zObjectId,
    import_date: z.date(),
    type: z.literal("france_competence"),
    archiveMeta: zArchiveMeta,
  })
  .strict();

export const zImportMetaSimple = z
  .object({
    _id: zObjectId,
    import_date: z.date(),
    type: z.enum(["bcn", "kit_apprentissage"]),
  })
  .strict();

export const zImportMetaCertifications = z
  .object({
    _id: zObjectId,
    import_date: z.date(),
    type: z.literal("certifications"),
    source: z.object({
      bcn: z.object({ import_date: z.date() }),
      franceCompetence: z.object({ import_date: z.date(), nom: z.string() }),
      kitApprentissage: z.object({ import_date: z.date() }),
    }),
  })
  .strict();

export const zImportMeta = z.discriminatedUnion("type", [
  zImportMetaFranceCompetence,
  zImportMetaSimple,
  zImportMetaCertifications,
]);

export const importMetaModelDescriptor = {
  zod: zImportMeta,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;

export type IImportMeta = z.output<typeof zImportMeta>;
export type IImportMetaFranceCompetence = z.output<typeof zImportMetaFranceCompetence>;
export type IImportMetaCertifications = z.output<typeof zImportMetaCertifications>;
