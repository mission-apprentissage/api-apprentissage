import { readdir } from "node:fs/promises";
import { Transform } from "node:stream";

import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { ObjectId } from "mongodb";
import { ISourceKitApprentissage } from "shared/models/source/kitApprentissage/source.kit_apprentissage.model";
import { pipeline } from "stream/promises";

import { withCause } from "@/services/errors/withCause";
import { getDbCollection } from "@/services/mongodb/mongodbService";
import { getStaticFilePath } from "@/utils/getStaticFilePath";
import { createBatchTransformStream } from "@/utils/streamUtils";

import { buildKitApprentissageEntry, getVersionNumber } from "./builder/kit_apprentissage.builder";

async function importKitApprentissageSource(
  importDate: Date,
  filename: ISourceKitApprentissage["source"]
): Promise<void> {
  try {
    const version = getVersionNumber(filename);

    await pipeline(
      createReadStream(getStaticFilePath(`kit_apprentissage/${filename}`)),
      parse({
        bom: true,
        columns: true,
        encoding: "utf-8",
        delimiter: ";",
        trim: true,
        quote: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRecord: (record, { columns }: any) => {
          return buildKitApprentissageEntry(columns, record, filename, importDate, version);
        },
      }),
      createBatchTransformStream({ size: 100 }),
      new Transform({
        objectMode: true,
        async transform(chunk, _encoding, callback) {
          try {
            await getDbCollection("source.kit_apprentissage").insertMany(chunk);
            callback();
          } catch (error) {
            callback(withCause(internal("import.kit_apprentissage: error when inserting"), error));
          }
        },
      })
    );
  } catch (error) {
    throw withCause(internal("import.kit_apprentissage: unable to importKitApprentissageSource", { filename }), error);
  }
}

async function listKitApprentissageFiles(): Promise<string[]> {
  return await readdir(getStaticFilePath("kit_apprentissage"));
}

export async function runKitApprentissageImporter(): Promise<number> {
  const importDate = new Date();

  try {
    const files = await listKitApprentissageFiles();
    for (const file of files) {
      await importKitApprentissageSource(importDate, file);
    }

    await getDbCollection("source.kit_apprentissage").deleteMany({
      date: { $ne: importDate },
    });

    await getDbCollection("import.meta").insertOne({
      _id: new ObjectId(),
      import_date: importDate,
      type: "kit_apprentissage",
    });

    return await getDbCollection("source.kit_apprentissage").countDocuments({ date: importDate });
  } catch (error) {
    await getDbCollection("source.kit_apprentissage").deleteMany({ date: importDate });
    throw withCause(internal("import.kit_apprentissage: unable to runKitApprentissageImporter"), error);
  }
}
