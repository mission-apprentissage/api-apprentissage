import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { ObjectId } from "mongodb";
import { zSourceCatalogue } from "shared/models/source/catalogue/source.catalogue.model";

import { fetchCatalogueData } from "@/services/apis/catalogue/catalogue.js";
import { withCause } from "@/services/errors/withCause.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

async function importCatalogueFormations(importDate: Date): Promise<void> {
  return pipeline(
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
}

export async function runCatalogueImporter() {
  const importDate = new Date();
  const importId = new ObjectId();

  try {
    await getDbCollection("import.meta").insertOne({
      _id: importId,
      import_date: importDate,
      type: "catalogue",
      status: "pending",
    });

    await importCatalogueFormations(importDate);

    await getDbCollection("source.catalogue").deleteMany({
      date: { $ne: importDate },
    });

    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });

    return await getDbCollection("source.catalogue").countDocuments({ date: importDate });
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    await getDbCollection("source.catalogue").deleteMany({ date: importDate });
    throw withCause(internal("import.catalogue: unable to runCatalogueImporter"), error);
  }
}
