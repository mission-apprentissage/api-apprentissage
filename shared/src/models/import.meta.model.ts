import { z } from "zod/v4-mini";

import { zDataGouvDatasetResource } from "../apis/index.js";
import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectId } from "./common.js";

const collectionName = "import.meta" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ type: 1, import_date: 1 }, {}],
  [{ type: 1, status: 1, import_date: 1 }, {}],
  [{ type: 1, "archiveMeta.date_publication": 1 }, {}],
];

export const zArchiveMeta = z.object({
  date_publication: z.date(),
  last_updated: z.date(),
  nom: z.string(),
  resource: z.extend(zDataGouvDatasetResource, {
    created_at: z.date(),
    last_modified: z.date(),
  }),
});

export type IArchiveMeta = z.output<typeof zArchiveMeta>;

export const zImportMetaFranceCompetence = z.object({
  _id: zObjectId,
  import_date: z.date(),
  type: z.literal("france_competence"),
  archiveMeta: zArchiveMeta,
  status: z.enum(["pending", "done", "failed"]),
});

export const zImportMetaNpec = z.object({
  _id: zObjectId,
  import_date: z.date(),
  type: z.literal("npec"),
  status: z.enum(["pending", "done", "failed"]),
  resource: z.string().check(z.url()),
  title: z.string(),
  description: z.string(),
  file_date: z.date(),
});

export const zImportMetaSimple = z.object({
  _id: zObjectId,
  import_date: z.date(),
  type: z.enum([
    "bcn",
    "kit_apprentissage",
    "acce",
    "kali_ccn",
    "communes",
    "referentiel",
    "catalogue",
    "mission_locale",
  ]),
  status: z.enum(["pending", "done", "failed"]),
});

export const zImportMetaDares = z.object({
  _id: zObjectId,
  import_date: z.date(),
  type: z.enum(["dares_ccn", "dares_ape_idcc"]),
  status: z.enum(["pending", "done", "failed"]),
  resource: z.object({
    title: z.string(),
    url: z.string().check(z.url()),
    date: z.date(),
  }),
});

export const zImportMetaCertifications = z.object({
  _id: zObjectId,
  import_date: z.date(),
  status: z.enum(["pending", "done", "failed"]),
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
});

export const zImportMetaOrganisme = z.object({
  _id: zObjectId,
  import_date: z.date(),
  status: z.enum(["pending", "done", "failed"]),
  type: z.literal("organismes"),
  source: z.object({
    referentiel: z.object({ import_date: z.date() }),
    communes: z.object({ import_date: z.date() }),
  }),
});

export const zImportMetaFormations = z.object({
  _id: zObjectId,
  import_date: z.date(),
  status: z.enum(["pending", "done", "failed"]),
  type: z.literal("formations"),
  source: z.object({
    organismes: z.object({ import_date: z.date() }),
    catalogue: z.object({ import_date: z.date() }),
    certifications: z.object({ import_date: z.date() }),
    communes: z.object({ import_date: z.date() }),
  }),
});

export const zImportMeta = z.discriminatedUnion("type", [
  zImportMetaFranceCompetence,
  zImportMetaSimple,
  zImportMetaCertifications,
  zImportMetaNpec,
  zImportMetaDares,
  zImportMetaOrganisme,
  zImportMetaFormations,
]);

export const importMetaModelDescriptor = {
  zod: zImportMeta,
  indexes,
  collectionName,
};

export type IImportMeta = z.output<typeof zImportMeta>;
export type IImportMetaFranceCompetence = z.output<typeof zImportMetaFranceCompetence>;
export type IImportMetaNpec = z.output<typeof zImportMetaNpec>;
export type IImportMetaCertifications = z.output<typeof zImportMetaCertifications>;
export type IImportMetaOrganismes = z.output<typeof zImportMetaOrganisme>;
export type IImportMetaFormations = z.output<typeof zImportMetaFormations>;
export type IImportMetaDares = z.output<typeof zImportMetaDares>;
