import { Transform } from "node:stream";

import { internal } from "@hapi/boom";
import { ObjectId } from "mongodb";
import type { ImportStatus } from "shared";
import type { IImportMetaFormations } from "shared/models/import.meta.model";
import type { ISourceCatalogue } from "shared/models/source/catalogue/source.catalogue.model";
import { pipeline } from "stream/promises";

import { areSourcesUpdated } from "@/jobs/importer/utils/areSourcesUpdated.js";
import { withCause } from "@/services/errors/withCause.js";
import parentLogger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

import { buildFormation } from "./builder/_.formation.builder.js";

const logger = parentLogger.child({ module: "import:organismes" });

async function getSourceImportMeta(): Promise<IImportMetaFormations["source"] | null> {
  const [organismesImport, catalogueImport, certificationImport, communesImport] = await Promise.all([
    getDbCollection("import.meta").findOne({ type: "organismes", status: "done" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne({ type: "catalogue", status: "done" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne({ type: "certifications", status: "done" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne({ type: "communes", status: "done" }, { sort: { import_date: -1 } }),
  ]);

  if (!organismesImport || !catalogueImport || !certificationImport || !communesImport) {
    return null;
  }

  return {
    organismes: { import_date: organismesImport.import_date },
    catalogue: { import_date: catalogueImport.import_date },
    certifications: { import_date: certificationImport.import_date },
    communes: { import_date: communesImport.import_date },
  };
}

async function getLatestImportMeta(): Promise<IImportMetaFormations | null> {
  const importMeta = await getDbCollection("import.meta").findOne<IImportMetaFormations>(
    { type: "formations", status: "done" },
    { sort: { import_date: -1 } }
  );

  return importMeta;
}

async function getImportMeta(): Promise<IImportMetaFormations | null> {
  const [latestImportMeta, sourceImportMeta] = await Promise.all([getLatestImportMeta(), getSourceImportMeta()]);

  if (!sourceImportMeta) {
    // Sources are not ready
    return null;
  }

  const importMeta: IImportMetaFormations = {
    _id: new ObjectId(),
    import_date: new Date(),
    status: "pending",
    type: "formations",
    source: sourceImportMeta,
  };

  return areSourcesUpdated(latestImportMeta?.source, sourceImportMeta) ? importMeta : null;
}

async function importFormationsFromCatalogue(
  importMeta: IImportMetaFormations
): Promise<{ success: number; skipped: number }> {
  const stats = {
    success: 0,
    skipped: 0,
  };

  const cursor = getDbCollection("source.catalogue").find({ date: importMeta.source.catalogue.import_date });

  await pipeline(
    cursor,
    new Transform({
      objectMode: true,
      async transform(chunk: ISourceCatalogue, _encoding, callback) {
        try {
          const formation = await buildFormation(chunk).catch((error) => {
            // Data quality for archived formations is not guaranteed
            if (chunk.data.published) {
              throw withCause(
                internal("import.formations: error when building formation", { chunk, importMeta }),
                error
              );
            }

            stats.skipped++;
            return null;
          });

          if (!formation) {
            return callback();
          }

          const { identifiant, ...rest } = formation;
          stats.success++;

          return callback(null, {
            updateOne: {
              filter: {
                "identifiant.cle_ministere_educatif": identifiant.cle_ministere_educatif,
              },
              update: {
                $set: {
                  ...rest,
                  updated_at: importMeta.import_date,
                },
                $setOnInsert: {
                  created_at: importMeta.import_date,
                },
              },
              upsert: true,
            },
          });
        } catch (error) {
          return callback(withCause(internal("import.formations: error when building formation", { chunk }), error));
        }
      },
    }),
    createBatchTransformStream({ size: 100 }),
    new Transform({
      objectMode: true,
      async transform(chunk, _encoding, callback) {
        try {
          await getDbCollection("formation").bulkWrite(chunk);
          callback();
        } catch (error) {
          callback(withCause(internal("import.formations: error when bulkWrite"), error));
        }
      },
    })
  );

  await getDbCollection("formation").updateMany(
    { updated_at: { $ne: importMeta.import_date } },
    { $set: { statut: { catalogue: "archivé" } } }
  );

  return stats;
}

export async function importFormations() {
  const importMeta = await getImportMeta();

  if (importMeta === null) {
    logger.info("import.formations: skipping import");
    return null;
  }

  try {
    await getDbCollection("import.meta").insertOne(importMeta);

    const stats = await importFormationsFromCatalogue(importMeta);

    await getDbCollection("import.meta").updateOne({ _id: importMeta._id }, { $set: { status: "done" } });

    return stats;
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importMeta._id }, { $set: { status: "failed" } });

    throw withCause(internal("import.formations: unable to importFormations"), error, "fatal");
  }
}

export async function getFormationsImporterStatus(): Promise<ImportStatus> {
  const [lastImport, lastSuccess] = await Promise.all([
    await getDbCollection("import.meta").findOne({ type: "formations" }, { sort: { import_date: -1 } }),
    await getDbCollection("import.meta").findOne({ type: "formations", status: "done" }, { sort: { import_date: -1 } }),
  ]);

  return {
    last_import: lastImport?.import_date ?? null,
    last_success: lastSuccess?.import_date ?? null,
    status: lastImport?.status ?? "pending",
    resources: [],
  };
}
