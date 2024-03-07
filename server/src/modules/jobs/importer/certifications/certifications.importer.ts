import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { AggregationCursor, ObjectId } from "mongodb";
import { ICertification } from "shared/models/certification.model";
import { IImportMetaCertifications, IImportMetaFranceCompetence } from "shared/models/import.meta.model";
import {
  IBcn_N_FormationDiplome,
  IBcn_N51_FormationDiplome,
  IBcn_V_FormationDiplome,
} from "shared/models/source/bcn/source.bcn.model";
import { ISourceFranceCompetence } from "shared/models/source/france_competence/source.france_competence.model";
import { ISourceKitApprentissage } from "shared/models/source/kitApprentissage/source.kit_apprentissage.model";

import parentLogger from "@/common/logger";

import { withCause } from "../../../../common/errors/withCause";
import { getDbCollection } from "../../../../common/utils/mongodbUtils";
import { createBatchTransformStream } from "../../../../common/utils/streamUtils";

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
  const missingEntries = await getDbCollection("source.kit_apprentissage")
    .aggregate([
      {
        $lookup: {
          from: "source.france_competence",
          localField: "data.FicheRNCP",
          foreignField: "numero_fiche",
          as: "france_competence",
        },
      },
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
          $expr: {
            $or: [
              // FicheRNCP is not NR and no france_competence entry not found
              { $and: [{ $ne: ["$data.FicheRNCP", "NR"] }, { $eq: [{ $size: "$france_competence" }, 0] }] },
              // bcn entry not found
              { $eq: [{ $size: "$bcn" }, 0] },
            ],
          },
        },
      },
    ])
    .toArray();

  if (missingEntries.length > 0) {
    throw internal(`Missing entries in source.kit_apprentissage`, { count: missingEntries.length, missingEntries });
  }
}

async function getSourceImportMeta(): Promise<IImportMetaCertifications["source"] | null> {
  const [kitApprentissage, bcn, franceCompetence] = await Promise.all([
    getDbCollection("import.meta").findOne({ type: "kit_apprentissage" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne({ type: "bcn" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne<IImportMetaFranceCompetence>(
      { type: "france_competence" },
      { sort: { import_date: -1, "archiveMeta.nom": -1 } }
    ),
  ]);

  if (!kitApprentissage || !bcn || !franceCompetence) {
    return null;
  }

  return {
    kitApprentissage: { import_date: kitApprentissage.import_date },
    bcn: { import_date: bcn.import_date },
    franceCompetence: { import_date: franceCompetence.import_date, nom: franceCompetence.archiveMeta.nom },
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

  if (latestImportMeta.source.kitApprentissage.import_date < sourceImportMeta.kitApprentissage.import_date) {
    return importMeta;
  }
  if (latestImportMeta.source.bcn.import_date < sourceImportMeta.bcn.import_date) {
    return importMeta;
  }
  if (latestImportMeta.source.franceCompetence.import_date < sourceImportMeta.franceCompetence.import_date) {
    return importMeta;
  }

  return null;
}

type ISourceAggregatedData = {
  bcn?: Array<IBcn_N_FormationDiplome | IBcn_N51_FormationDiplome | IBcn_V_FormationDiplome> | null;
  kit_apprentissage?: ISourceKitApprentissage | null;
  france_competence: ISourceFranceCompetence | null;
};

export async function buildCertification(
  data: ISourceAggregatedData
): Promise<Omit<ICertification, "_id" | "created_at" | "updated_at">> {
  const cfd = data.bcn?.[0]?.data.FORMATION_DIPLOME || null;
  const rncp = data.france_competence?.numero_fiche || null;

  return {
    code: { cfd, rncp },
  };
}

export async function buildCertificationUpdateOperation(data: ISourceAggregatedData, importDate: Date) {
  const { code, ...value } = await buildCertification(data);

  return {
    updateOne: {
      filter: { code },
      update: {
        $set: {
          ...value,
          updated_at: importDate,
        },
        $setOnInsert: { _id: new ObjectId(), created_at: importDate },
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
          $in: ["N_FORMATION_DIPLOME", "N_FORMATION_DIPLOME_ENQUETE_51", "V_FORMATION_DIPLOME"],
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

export async function importSourceAggregatedData(cursor: AggregationCursor<ISourceAggregatedData>, importDate: Date) {
  await pipeline(
    cursor,
    new Transform({
      objectMode: true,
      async transform(chunk: ISourceAggregatedData, _encoding, callback) {
        try {
          const op = await buildCertificationUpdateOperation(chunk, importDate);
          callback(null, op);
        } catch (error) {
          callback(withCause(internal("import.certifications: error when building certification"), error));
        }
      },
    }),
    createBatchTransformStream({ size: 1_000 }),
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
  const importMeta = await getImportMeta();
  if (importMeta === null) {
    logger.info("Skipping certifications import");
    return null;
  }

  await controlKitApprentissageCoverage();

  await importSourceAggregatedData(getSourceAggregatedDataFromBcn(), importMeta.import_date);

  await importSourceAggregatedData(getSourceAggregatedDataFromFranceCompetence(), importMeta.import_date);

  const stats = await computeImportStats(importMeta.import_date);

  await getDbCollection("certifications").deleteMany({ updated_at: { $ne: importMeta.import_date } });

  await getDbCollection("import.meta").insertOne(importMeta);

  return stats;
}
