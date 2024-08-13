import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { AnyBulkWriteOperation, ObjectId } from "mongodb";
import { ISourceCatalogue, zSourceCatalogue } from "shared/models/source/catalogue/source.catalogue.model";

import { fetchCatalogueData } from "@/services/apis/catalogue/catalogue.js";
import { fetchCatalogueEducatifData } from "@/services/apis/catalogue/catalogueEducatif.js";
import { withCause } from "@/services/errors/withCause.js";
import parentLogger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

const logger = parentLogger.child({ module: "import:catalogue" });

async function importCatalogueFormations(importDate: Date): Promise<number> {
  try {
    await pipeline(
      await fetchCatalogueData(),
      new Transform({
        objectMode: true,
        transform(data, _encoding, callback) {
          callback(
            null,
            zSourceCatalogue.parse({
              _id: new ObjectId(),
              date: importDate,
              data,
            })
          );
        },
      }),
      createBatchTransformStream({ size: 100 }),
      new Transform({
        objectMode: true,
        async transform(chunk, _encoding, callback) {
          try {
            await getDbCollection("source.catalogue").insertMany(chunk);
            callback();
          } catch (error) {
            callback(withCause(internal("import.catalogue: error when inserting"), error));
          }
        },
      })
    );

    await getDbCollection("source.catalogue").deleteMany({
      date: { $ne: importDate },
    });

    return await getDbCollection("source.catalogue").countDocuments({ date: importDate });
  } catch (error) {
    throw withCause(internal("import.catalogue: unable to importCatalogueFormations"), error);
  }
}

async function importCatalogueEducatifUaiFormation(importDate: Date): Promise<void> {
  try {
    await pipeline(
      await fetchCatalogueEducatifData(),
      new Transform({
        objectMode: true,
        transform(data, _encoding, callback) {
          const op: AnyBulkWriteOperation<ISourceCatalogue> = {
            updateOne: {
              filter: { date: importDate, "data.cle_ministere_educatif": data.cle_ministere_educatif },
              update: { $set: { "data.uai_formation": data.uai_formation } },
            },
          };
          callback(null, op);
        },
      }),
      createBatchTransformStream({ size: 100 }),
      new Transform({
        objectMode: true,
        async transform(chunk, _encoding, callback) {
          try {
            await getDbCollection("source.catalogue").bulkWrite(chunk, { ordered: false });
            callback();
          } catch (error) {
            callback(withCause(internal("import.catalogue: error when inserting"), error));
          }
        },
      })
    );
  } catch (error) {
    throw withCause(internal("import.catalogue: unable to importCatalogueFormations"), error);
  }
}

export async function runCatalogueImporter() {
  const importDate = new Date();

  try {
    logger.info("Geting Catalogue ...");
    const importedCount = await importCatalogueFormations(importDate);
    await importCatalogueEducatifUaiFormation(importDate);
    return importedCount;
  } catch (error) {
    throw withCause(internal("import.catalogue: unable to runCatalogueImporter"), error);
  }
}
