import type { ReadStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { parse } from "csv-parse";
import { ObjectId } from "mongodb";
import acceModelDescriptor from "shared/models/acce/acce.model";
// import { IAcceSpecificite } from "shared/models/acce/acce.specificite.part";
// import { IAcceZone } from "shared/models/acce/acce.zone.part";
import unzipper from "unzipper";

import parentLogger from "@/common/logger";

import { downloadCsvExtraction } from "../../../common/apis/acce";
import { getDbCollection } from "../../../common/utils/mongodbUtils";
import { createBatchTransformStream } from "../../../common/utils/streamUtils";

const logger = parentLogger.child({ module: "import:acce" });

async function parseAcceFile(stream: ReadStream, source: string, date: Date) {
  await pipeline(
    stream,
    parse({
      bom: true,
      columns: true,
      relax_column_count: true,
      encoding: "latin1",
      delimiter: ";",
      trim: true,
    }),
    createBatchTransformStream({ size: 100 }),
    new Transform({
      objectMode: true,
      async transform(chunk, _encoding, callback) {
        try {
          await getDbCollection("source.acce").insertMany(
            chunk.map((data: unknown) =>
              acceModelDescriptor.zod.parse({
                _id: new ObjectId(),
                source,
                date,
                data,
              })
            )
          );
          callback();
        } catch (error) {
          callback(error);
        }
      },
    })
  );
}

export async function importAcceData(readStream: ReadStream) {
  const importDate = new Date();

  const zip = readStream.pipe(unzipper.Parse({ forceStream: true }));
  for await (const entry of zip) {
    await parseAcceFile(entry, entry.path, importDate);
    entry.autodrain();
  }

  await getDbCollection("source.acce").deleteMany({
    date: { $ne: importDate },
  });
}

// 17/01/2024 151_510 records
export const run_acce_importer = async () => {
  logger.info("Geting ACCE file...");

  const stream = await downloadCsvExtraction();

  logger.info("Import ACCE data starting...");

  await importAcceData(stream);
};
