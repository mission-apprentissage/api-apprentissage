import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { AggregationCursor, ObjectId } from "mongodb";
import { IImportMetaCertifications, IImportMetaFranceCompetence } from "shared/models/import.meta.model";

import { withCause } from "@/common/errors/withCause";
import parentLogger from "@/common/logger";
import { getDbCollection } from "@/common/utils/mongodbUtils";
import { createBatchTransformStream } from "@/common/utils/streamUtils";

import { buildCertification, ISourceAggregatedData } from "./builder/certification.builder";
import { buildInterministerielSearchMap, INiveauInterministerielSearchMap } from "./builder/certification.cfd.builder";

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

export async function controlKitApprentissageCoverage() {
  const missingBcnEntries = await getDbCollection("source.kit_apprentissage")
    .aggregate([
      {
        $lookup: {
          from: "source.bcn",
          localField: "data.Code Diplôme",
          foreignField: "data.FORMATION_DIPLOME",
          as: "bcn",
        },
      },
      {
        $match: {
          bcn: { $size: 0 },
        },
      },
    ])
    .toArray();

  if (missingBcnEntries.length > 0) {
    throw internal(`Missing bcn entries in source.kit_apprentissage`, {
      count: missingBcnEntries.length,
      missingBcnEntries,
    });
  }

  const missingEntries = await getDbCollection("source.kit_apprentissage")
    .aggregate([
      {
        $match: { "data.FicheRNCP": { $ne: "NR" } },
      },
      {
        $lookup: {
          from: "source.france_competence",
          localField: "data.FicheRNCP",
          foreignField: "numero_fiche",
          as: "france_competence",
        },
      },
      {
        $match: { france_competence: { $size: 0 } },
      },
      // {
      //   $unwind: {
      //       path: "$france_competence",
      //       preserveNullAndEmptyArrays: true,
      //     },
      // },
      // {
      //   $addFields: {
      //       voies_d_acces: {
      //         $ifNull: [
      //           "$france_competence.data.voies_d_acces.Si_Jury",
      //           [],
      //         ],
      //       },
      //     },
      // },
      // {
      //   $addFields: {
      //       apprentissageOrProfessionnalisation: {
      //         $or: [
      //           {
      //             $in: [
      //               "En contrat d'apprentissage",
      //               "$voies_d_acces",
      //             ],
      //           },
      //           {
      //             $in: [
      //               "En contrat de professionnalisation",
      //               "$voies_d_acces",
      //             ],
      //           },
      //         ],
      //       },
      //     },
      // },
      // {
      //   $match: {    apprentissageOrProfessionnalisation: false,},
      // },
    ])
    .toArray();

  if (missingEntries.length > 0) {
    throw internal(`Missing entries in source.kit_apprentissage`, { count: missingEntries.length, missingEntries });
  }
}

async function getSourceImportMeta(): Promise<IImportMetaCertifications["source"] | null> {
  const [kitApprentissage, bcn, franceCompetenceLatest, oldestFranceCompetence] = await Promise.all([
    getDbCollection("import.meta").findOne({ type: "kit_apprentissage" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne({ type: "bcn" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne<IImportMetaFranceCompetence>(
      { type: "france_competence" },
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
    { type: "certifications" },
    { sort: { import_date: -1 } }
  );

  return importMeta;
}

export async function getImportMeta(): Promise<IImportMetaCertifications | null> {
  const [latestImportMeta, sourceImportMeta] = await Promise.all([getLatestImportMeta(), getSourceImportMeta()]);

  if (!sourceImportMeta) {
    // Sources are not ready
    return null;
  }

  const importMeta: IImportMetaCertifications = {
    _id: new ObjectId(),
    import_date: new Date(),
    type: "certifications",
    source: sourceImportMeta,
  };

  if (!latestImportMeta) {
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

export function buildCertificationUpdateOperation(
  data: ISourceAggregatedData,
  importMeta: IImportMetaCertifications,
  niveauInterministerielSearchMap: INiveauInterministerielSearchMap
) {
  const { code, ...value } = buildCertification(
    data,
    importMeta.source.france_competence.oldest_date_publication,
    niveauInterministerielSearchMap
  );

  return {
    updateOne: {
      filter: { code },
      update: {
        $set: {
          ...value,
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
        source: "V_FORMATION_DIPLOME",
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
      $match: { kit_apprentissage: { $size: 0 } },
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
  importMeta: IImportMetaCertifications,
  niveauInterministerielSearchMap: INiveauInterministerielSearchMap
) {
  await pipeline(
    cursor,
    new Transform({
      objectMode: true,
      async transform(chunk: ISourceAggregatedData, _encoding, callback) {
        try {
          const op = buildCertificationUpdateOperation(chunk, importMeta, niveauInterministerielSearchMap);
          callback(null, op);
        } catch (error) {
          callback(withCause(internal("import.certifications: error when building certification"), error));
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
      "code.cfd": { $ne: null },
      "code.rncp": null,
      updated_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      "code.rncp": { $ne: null },
      "code.cfd": null,
      updated_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      updated_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      "code.cfd": { $ne: null },
      "code.rncp": null,
      created_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      "code.rncp": { $ne: null },
      "code.cfd": null,
      created_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      created_at: importDate,
    }),
    getDbCollection("certifications").countDocuments({
      "code.cfd": { $ne: null },
      "code.rncp": null,
      updated_at: { $ne: importDate },
    }),
    getDbCollection("certifications").countDocuments({
      "code.rncp": { $ne: null },
      "code.cfd": null,
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

export async function importCertifications() {
  try {
    const importMeta = await getImportMeta();

    if (importMeta === null) {
      logger.info("import.certifications: skipping import");
      return null;
    }

    await controlKitApprentissageCoverage();

    const niveauInterministerielSearchMap = await buildInterministerielSearchMap();

    await importSourceAggregatedData(getSourceAggregatedDataFromBcn(), importMeta, niveauInterministerielSearchMap);

    await importSourceAggregatedData(
      getSourceAggregatedDataFromFranceCompetence(),
      importMeta,
      niveauInterministerielSearchMap
    );

    const stats = await computeImportStats(importMeta.import_date);

    await getDbCollection("certifications").deleteMany({ updated_at: { $ne: importMeta.import_date } });

    await getDbCollection("import.meta").insertOne(importMeta);

    return stats;
  } catch (error) {
    throw withCause(internal("import.certifications: unable to importCertifications"), error);
  }
}
