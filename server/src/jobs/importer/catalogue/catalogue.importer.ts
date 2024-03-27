import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { ObjectId } from "mongodb";
import { zSourceCatalogue } from "shared/models/source/catalogue/source.catalogue.model";

import parentLogger from "@/services/logger";

import { fetchCatalogueData } from "../../../services/apis/catalogue/catalogue";
import { withCause } from "../../../services/errors/withCause";
import { getDbCollection } from "../../../services/mongodb/mongodbService";
import { createBatchTransformStream } from "../../../utils/streamUtils";

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

export async function runCatalogueImporter() {
  const importDate = new Date();

  try {
    logger.info("Getting Catalogue ...");
    return await importCatalogueFormations(importDate);
  } catch (error) {
    throw withCause(internal("import.catalogue: unable to runCatalogueImporter"), error);
  }
}
