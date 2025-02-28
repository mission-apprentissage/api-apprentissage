import { Transform } from "node:stream";

import { internal } from "@hapi/boom";
import type { AnyBulkWriteOperation } from "mongodb";
import { ObjectId } from "mongodb";
import type { ImportStatus } from "shared";
import type { IImportMetaOrganismes } from "shared/models/import.meta.model";
import type { IOrganismeInternal } from "shared/models/organisme.model";
import type { ISourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";
import { pipeline } from "stream/promises";

import { areSourcesSuccess, areSourcesUpdated } from "@/jobs/importer/utils/areSourcesUpdated.js";
import { withCause } from "@/services/errors/withCause.js";
import parentLogger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

import { buildOrganisme, buildOrganismeContext, buildOrganismeEntrepriseParts } from "./builder/organisme.builder.js";

const logger = parentLogger.child({ module: "import:organismes" });

async function getSourceImportMeta(): Promise<IImportMetaOrganismes["source"] | null> {
  const [referentielImport, communesImport] = await Promise.all([
    getDbCollection("import.meta").findOne({ type: "referentiel" }, { sort: { import_date: -1 } }),
    getDbCollection("import.meta").findOne({ type: "communes" }, { sort: { import_date: -1 } }),
  ]);

  if (!areSourcesSuccess([referentielImport, communesImport])) {
    return null;
  }

  return {
    referentiel: { import_date: referentielImport!.import_date },
    communes: { import_date: communesImport!.import_date },
  };
}

async function getLatestImportMeta(): Promise<IImportMetaOrganismes | null> {
  const importMeta = await getDbCollection("import.meta").findOne<IImportMetaOrganismes>(
    { type: "organismes", status: "done" },
    { sort: { import_date: -1 } }
  );

  return importMeta;
}

async function getImportMeta(force: boolean): Promise<IImportMetaOrganismes | null> {
  const [latestImportMeta, sourceImportMeta] = await Promise.all([getLatestImportMeta(), getSourceImportMeta()]);

  if (!sourceImportMeta) {
    // Sources are not ready
    return null;
  }

  const importMeta: IImportMetaOrganismes = {
    _id: new ObjectId(),
    import_date: new Date(),
    status: "pending",
    type: "organismes",
    source: sourceImportMeta,
  };

  return force || areSourcesUpdated(latestImportMeta?.source, sourceImportMeta) ? importMeta : null;
}

async function buildOrganismeUpdateOperation(
  chunk: ISourceReferentiel,
  importMeta: IImportMetaOrganismes
): Promise<AnyBulkWriteOperation<IOrganismeInternal> | null> {
  const context = await buildOrganismeContext(chunk.data.siret);

  if (context === null) {
    return null;
  }

  const { identifiant, ...rest } = buildOrganisme(chunk.data, context, "présent");

  return {
    updateOne: {
      filter: {
        "identifiant.siret": identifiant.siret,
        "identifiant.uai": { $in: [identifiant.uai, null] },
      },
      update: {
        $set: {
          ...rest,
          "identifiant.uai": identifiant.uai,
          updated_at: importMeta.import_date,
        },
        $setOnInsert: {
          created_at: importMeta.import_date,
        },
      },
      upsert: true,
    },
  };
}

async function buildHistoricalOrganismeUpdateOperation(
  chunk: IOrganismeInternal,
  importMeta: IImportMetaOrganismes
): Promise<AnyBulkWriteOperation<IOrganismeInternal> | null> {
  const context = await buildOrganismeContext(chunk.identifiant.siret);

  if (context === null) {
    return null;
  }

  const data = buildOrganismeEntrepriseParts(chunk.identifiant.siret, context);

  return {
    updateOne: {
      filter: { _id: chunk._id },
      update: {
        $set: {
          ...data,
          updated_at: importMeta.import_date,
          statut: {
            referentiel: "supprimé",
          },
        },
      },
    },
  };
}

async function importOrganismesFromReferentiel(importMeta: IImportMetaOrganismes) {
  const cursor = getDbCollection("source.referentiel").find({ date: importMeta.source.referentiel.import_date });

  await pipeline(
    cursor,
    new Transform({
      objectMode: true,
      async transform(chunk: ISourceReferentiel, _encoding, callback) {
        try {
          const op = await buildOrganismeUpdateOperation(chunk, importMeta);
          if (op !== null) {
            return callback(null, op);
          } else {
            return callback();
          }
        } catch (error) {
          callback(
            withCause(internal("import.organismes: error when building organisme", { chunk, importMeta }), error)
          );
        }
      },
    }),
    createBatchTransformStream({ size: 100 }),
    new Transform({
      objectMode: true,
      async transform(chunk, _encoding, callback) {
        try {
          await getDbCollection("organisme").bulkWrite(chunk);
          callback();
        } catch (error) {
          callback(withCause(internal("import.organismes: error when bulkWrite"), error));
        }
      },
    })
  );
}

async function updateHistoricalOrganismes(importMeta: IImportMetaOrganismes) {
  const cursor = getDbCollection("organisme").find({ updated_at: { $ne: importMeta.import_date } });

  await pipeline(
    cursor,
    new Transform({
      objectMode: true,
      async transform(chunk: IOrganismeInternal, _encoding, callback) {
        try {
          const op = await buildHistoricalOrganismeUpdateOperation(chunk, importMeta);
          if (op !== null) {
            return callback(null, op);
          } else {
            return callback();
          }
        } catch (error) {
          callback(
            withCause(
              internal("import.organismes: error when building historical organisme", { chunk, importMeta }),
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
          await getDbCollection("organisme").bulkWrite(chunk);
          callback();
        } catch (error) {
          callback(withCause(internal("import.organismes: error when bulkWrite historical organisme"), error));
        }
      },
    })
  );
}

export async function importOrganismes(force: boolean = false) {
  const importMeta = await getImportMeta(force);

  if (importMeta === null) {
    logger.info("import.organismes: skipping import");
    return null;
  }

  try {
    await getDbCollection("import.meta").insertOne(importMeta);

    await importOrganismesFromReferentiel(importMeta);
    await updateHistoricalOrganismes(importMeta);

    await getDbCollection("import.meta").updateOne({ _id: importMeta._id }, { $set: { status: "done" } });

    return null;
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importMeta._id }, { $set: { status: "failed" } });
    await getDbCollection("organisme").deleteMany({ updated_at: importMeta.import_date });

    throw withCause(internal("import.organisme: unable to importOrganismes"), error, "fatal");
  }
}

export async function getOrganismesImporterStatus(): Promise<ImportStatus> {
  const [lastImport, lastSuccess] = await Promise.all([
    await getDbCollection("import.meta").findOne({ type: "organismes" }, { sort: { import_date: -1 } }),
    await getDbCollection("import.meta").findOne({ type: "organismes", status: "done" }, { sort: { import_date: -1 } }),
  ]);

  return {
    last_import: lastImport?.import_date ?? null,
    last_success: lastSuccess?.import_date ?? null,
    status: lastImport?.status ?? "pending",
    resources: [],
  };
}
