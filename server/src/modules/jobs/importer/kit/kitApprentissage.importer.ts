import { Transform } from "node:stream";

import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { ObjectId } from "mongodb";
import {
  ISourceKitApprentissage,
  zKitApprentissage,
} from "shared/models/source/kitApprentissage/source.kit_apprentissage.model";
import { pipeline } from "stream/promises";

import { withCause } from "@/common/errors/withCause";
import { getStaticFilePath } from "@/common/utils/getStaticFilePath";
import { getDbCollection } from "@/common/utils/mongodbUtils";
import { createBatchTransformStream } from "@/common/utils/streamUtils";

async function importKitApprentissageSource(filename: ISourceKitApprentissage["source"]): Promise<number> {
  const date = new Date();

  try {
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
          const data = columns.reduce((acc: Record<string, string | null>, column: { name: string }) => {
            // Replace all mongodb dot special character with underscore
            acc[column.name.replaceAll(".", "_")] = record[column.name]?.trim() || null;
            return acc;
          }, {});
          return zKitApprentissage.parse({
            _id: new ObjectId(),
            source: filename,
            date,
            data,
          });
        },
      }),
      createBatchTransformStream({ size: 1_000 }),
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

    await getDbCollection("source.kit_apprentissage").deleteMany({
      source: filename,
      date: { $ne: date },
    });

    await getDbCollection("import.meta").insertOne({
      _id: new ObjectId(),
      import_date: date,
      type: "kit_apprentissage",
    });

    return await getDbCollection("source.kit_apprentissage").countDocuments({ date, source: filename });
  } catch (error) {
    await getDbCollection("source.kit_apprentissage").deleteMany({ date });
    throw withCause(internal("import.kit_apprentissage: unable to importKitApprentissageSource", { filename }), error);
  }
}

export async function runKitApprentissageImporter(): Promise<number> {
  try {
    return await importKitApprentissageSource("kit_apprentissage_20240119.csv");
  } catch (error) {
    throw withCause(internal("import.kit_apprentissage: unable to runKitApprentissageImporter"), error);
  }
}
