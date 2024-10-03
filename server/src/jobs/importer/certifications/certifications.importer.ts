import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import type { AggregationCursor } from "mongodb";
import { ObjectId } from "mongodb";
import type { IImportMetaCertifications, IImportMetaFranceCompetence } from "shared/models/import.meta.model";

import { withCause } from "@/services/errors/withCause.js";
import parentLogger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

import type { ISourceAggregatedData } from "./builder/certification.builder.js";
import { buildCertification } from "./builder/certification.builder.js";
import { validateNiveauFormationDiplomeToInterministerielRule } from "./builder/intitule/certification.intitule.builder.js";
import { processContinuite } from "./process/continuite.process.js";
import { processCertificationCoverage } from "./process/coverage.process.js";

const logger = parentLogger.child({ module: "import:certifications" });

type IImportStatItem = {
  orphanCfd: number;
  orphanRncp: number;
  total: number;
};

type IImportStat = {
  total: IImportStatItem;
  created: IImportStatItem;
  deleted: IImportStatItem;
};

type ImportCertificationsOptions = {
  force?: boolean | undefined;
};

async function getSourceImportMeta(): Promise<IImportMetaCertifications["source"] | null> {
  const [kitApprentissage, bcn, franceCompetenceLatest, oldestFranceCompetence] = await Promise.all([
    getDbCollection("import.meta").findOne({ type: "kit_apprentissage" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne({ type: "bcn" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne<IImportMetaFranceCompetence>(
      { type: "france_competence", status: "done" },
      { sort: { import_date: -1, "archiveMeta.nom": -1 } }
    ),
    getDbCollection("import.meta").findOne<IImportMetaFranceCompetence>(
      { type: "france_competence" },
      { sort: { "archiveMeta.date_publication": 1 } }
    ),
  ]);

  if (!kitApprentissage || !bcn || !franceCompetenceLatest || !oldestFranceCompetence) {
    return null;
  }

  return {
    kit_apprentissage: { import_date: kitApprentissage.import_date },
    bcn: { import_date: bcn.import_date },
    france_competence: {
      import_date: franceCompetenceLatest.import_date,
      nom: franceCompetenceLatest.archiveMeta.nom,
      oldest_date_publication: oldestFranceCompetence.archiveMeta.date_publication,
    },
  };
}

async function getLatestImportMeta(): Promise<IImportMetaCertifications | null> {
  const importMeta = await getDbCollection("import.meta").findOne<IImportMetaCertifications>(
    { type: "certifications", status: "done" },
    { sort: { import_date: -1 } }
  );

  return importMeta;
}

async function getImportMeta(options: ImportCertificationsOptions | null): Promise<IImportMetaCertifications | null> {
  const [latestImportMeta, sourceImportMeta] = await Promise.all([getLatestImportMeta(), getSourceImportMeta()]);

  if (!sourceImportMeta) {
    // Sources are not ready
    return null;
  }

  const importMeta: IImportMetaCertifications = {
    _id: new ObjectId(),
    import_date: new Date(),
    status: "pending",
    type: "certifications",
    source: sourceImportMeta,
  };

  if (!latestImportMeta || options?.force === true) {
    // Initial import
    return importMeta;
  }

  if (latestImportMeta.source.kit_apprentissage.import_date < sourceImportMeta.kit_apprentissage.import_date) {
    return importMeta;
  }
  if (latestImportMeta.source.bcn.import_date < sourceImportMeta.bcn.import_date) {
    return importMeta;
  }
  if (latestImportMeta.source.france_competence.import_date < sourceImportMeta.france_competence.import_date) {
    return importMeta;
  }

  return null;
}

export function buildCertificationUpdateOperation(data: ISourceAggregatedData, importMeta: IImportMetaCertifications) {
  const { identifiant, ...value } = buildCertification(
    data,
    importMeta.source.france_competence.oldest_date_publication
  );

  return {
    updateOne: {
      filter: { "identifiant.cfd": identifiant.cfd, "identifiant.rncp": identifiant.rncp },
      update: {
        $set: {
          ...value,
          "identifiant.rncp_anterieur_2019": identifiant.rncp_anterieur_2019,
          updated_at: importMeta.import_date,
        },
        $setOnInsert: { _id: new ObjectId(), created_at: importMeta.import_date },
      },
      upsert: true,
    },
  };
}

export function getSourceAggregatedDataFromBcn(): AggregationCursor<ISourceAggregatedData> {
  return getDbCollection("source.bcn").aggregate<ISourceAggregatedData>([
    {
      $match: {
        source: {
          $in: ["N_FORMATION_DIPLOME", "N_FORMATION_DIPLOME_ENQUETE_51"],
        },
      },
    },
    {
      $group: {
        _id: "$data.FORMATION_DIPLOME",
        bcn: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $unwind: {
        path: "$bcn",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "source.kit_apprentissage",
        localField: "_id",
        foreignField: "data.Code Diplôme",
        as: "kit_apprentissage",
      },
    },
    {
      $unwind: {
        path: "$kit_apprentissage",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "source.france_competence",
        localField: "kit_apprentissage.data.FicheRNCP",
        foreignField: "numero_fiche",
        as: "france_competence",
      },
    },
    {
      $unwind: {
        path: "$france_competence",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        bcn: "$bcn",
        france_competence: "$france_competence",
      },
    },
  ]);
}

export function getSourceAggregatedDataFromFranceCompetence(): AggregationCursor<ISourceAggregatedData> {
  return getDbCollection("source.france_competence").aggregate<ISourceAggregatedData>([
    {
      $match: {
        numero_fiche: /^RNCP/,
        // On filtre les fiches eligible en apprentissage ou professionnalisation
        "data.voies_d_acces.Si_Jury": {
          $in: ["En contrat d’apprentissage", "En contrat de professionnalisation"],
        },
      },
    },
    {
      $lookup: {
        from: "source.kit_apprentissage",
        localField: "numero_fiche",
        foreignField: "data.FicheRNCP",
        as: "kit_apprentissage",
      },
    },
    {
      $unwind: {
        path: "$kit_apprentissage",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "source.bcn",
        let: { cfd: "$kit_apprentissage.data.Code Diplôme" },
        as: "bcn",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $ne: ["$source", "N_NIVEAU_FORMATION_DIPLOME"] },
                  { $eq: ["$data.FORMATION_DIPLOME", "$$cfd"] },
                ],
              },
            },
          },
        ],
      },
    },
    {
      $match: { bcn: { $size: 0 } },
    },
    {
      $project: {
        france_competence: "$$ROOT",
      },
    },
  ]);
}

export async function importSourceAggregatedData(
  cursor: AggregationCursor<ISourceAggregatedData>,
  importMeta: IImportMetaCertifications
) {
  await pipeline(
    cursor,
    new Transform({
      objectMode: true,
      async transform(chunk: ISourceAggregatedData, _encoding, callback) {
        try {
          const op = buildCertificationUpdateOperation(chunk, importMeta);
          callback(null, op);
        } catch (error) {
          callback(
            withCause(
              internal("import.certifications: error when building certification", { chunk, importMeta }),
              error
            )
          );
        }
      },
    }),
    createBatchTransformStream({ size: 100 }),
    new Transform({
      objectMode: true,
      async transform(chunk, _encoding, callback) {
        try {
          await getDbCollection("certifications").bulkWrite(chunk);
          callback();
        } catch (error) {
          callback(withCause(internal("import.certifications: error when bulkWrite"), error));
        }
      },
    })
  );
}

async function computeImportStats(importDate: Date): Promise<IImportStat> {
  const [
    totalOrphanCfd,
    totalOrphanRncp,
    total,
    createdOrphanCfd,
    createdOrphanRncp,
    created,
    deletedOrphanCfd,
    deletedOrphanRncp,
    deleted,
  ] = await Promise.all([
    getDbCollection("certifications").countDocuments({
      "identifiant.cfd": { $ne: null },
      "identifiant.rncp": null,
      updated_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      "identifiant.rncp": { $ne: null },
      "identifiant.cfd": null,
      updated_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      updated_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      "identifiant.cfd": { $ne: null },
      "identifiant.rncp": null,
      created_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      "identifiant.rncp": { $ne: null },
      "identifiant.cfd": null,
      created_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      created_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      "identifiant.cfd": { $ne: null },
      "identifiant.rncp": null,
      updated_at: { $ne: importDate },
    }),
    getDbCollection("certifications").countDocuments({
      "identifiant.rncp": { $ne: null },
      "identifiant.cfd": null,
      updated_at: { $ne: importDate },
    }),
    getDbCollection("certifications").countDocuments({
      updated_at: { $ne: importDate },
    }),
  ]);

  return {
    total: {
      orphanCfd: totalOrphanCfd,
      orphanRncp: totalOrphanRncp,
      total,
    },
    created: {
      orphanCfd: createdOrphanCfd,
      orphanRncp: createdOrphanRncp,
      total: created,
    },
    deleted: {
      orphanCfd: deletedOrphanCfd,
      orphanRncp: deletedOrphanRncp,
      total: deleted,
    },
  };
}

export async function importCertifications(options: ImportCertificationsOptions | null = null) {
  const importMeta = await getImportMeta(options);

  if (importMeta === null) {
    logger.info("import.certifications: skipping import");
    return null;
  }

  try {
    await getDbCollection("import.meta").insertOne(importMeta);

    await validateNiveauFormationDiplomeToInterministerielRule();

    await importSourceAggregatedData(getSourceAggregatedDataFromBcn(), importMeta);

    await importSourceAggregatedData(getSourceAggregatedDataFromFranceCompetence(), importMeta);

    await processCertificationCoverage(importMeta);
    await processContinuite(importMeta);

    const stats = await computeImportStats(importMeta.import_date);

    await getDbCollection("certifications").deleteMany({ updated_at: { $ne: importMeta.import_date } });

    await getDbCollection("import.meta").updateOne({ _id: importMeta._id }, { $set: { status: "done" } });

    return stats;
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importMeta._id }, { $set: { status: "failed" } });
    await getDbCollection("certifications").deleteMany({ updated_at: importMeta.import_date });

    throw withCause(internal("import.certifications: unable to importCertifications"), error, "fatal");
  }
}
