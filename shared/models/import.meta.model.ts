import { z } from "zod";

import { zDataGouvDatasetResource } from "../apis";
import { IModelDescriptor, zObjectId } from "./common";

const collectionName = "import.meta" as const;

const indexes: IModelDescriptor["indexes"] = [
  [{ type: 1, import_date: 1 }, {}],
  [{ type: 1, status: 1, import_date: 1 }, {}],
  [{ type: 1, "archiveMeta.date_publication": 1 }, {}],
];

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
    status: z.enum(["pending", "done"]),
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
      france_competence: z.object({
        import_date: z.date(),
        nom: z.string(),
        oldest_date_publication: z.date(),
      }),
      kit_apprentissage: z.object({ import_date: z.date() }),
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