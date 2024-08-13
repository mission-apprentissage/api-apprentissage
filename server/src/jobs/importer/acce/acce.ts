import type { ReadStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { ObjectId } from "mongodb";
import { ISourceAcce, ZAcceByType } from "shared/models/source/acce/source.acce.model";
import { Parse } from "unzipper";

import { downloadCsvExtraction } from "@/services/apis/acce/acce.js";
import { withCause } from "@/services/errors/withCause.js";
import parentLogger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

const logger = parentLogger.child({ module: "import:acce" });

async function parseAcceFile(stream: ReadStream, source: string, date: Date) {
  try {
    const zod = ZAcceByType[source as keyof typeof ZAcceByType] ?? null;

    if (zod === null) {
      throw internal("import.acce: unexpected source file", { source });
    }

    await pipeline(
      stream,
      parse({
        bom: true,
        columns: true,
        relax_column_count: true,
        encoding: "latin1",
        delimiter: ";",
        trim: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRecord: (record, { columns }: any) => {
          const data = columns.reduce((acc: Record<string, string | null>, column: { name: string }) => {
            acc[column.name] = record[column.name]?.trim() || null;
            return acc;
          }, {});

          return zod.parse({
            _id: new ObjectId(),
            source,
            date,
            data,
          });
        },
      }),
      createBatchTransformStream({ size: 100 }),
      new Transform({
        objectMode: true,
        async transform(chunk, _encoding, callback) {
          try {
            await getDbCollection("source.acce").insertMany(chunk);
            callback();
          } catch (error) {
            callback(withCause(internal("import.acce: error when inserting"), error));
          }
        },
      })
    );

    await getDbCollection("source.acce").deleteMany({
      source: source as ISourceAcce["source"],
      date: { $ne: date },
    });
  } catch (error) {
    throw withCause(internal("import.acce: unable to parseAcceFile", { source }), error);
  }
}

export async function importAcceData(readStream: ReadStream, importDate: Date) {
  const zip = readStream.pipe(Parse({ forceStream: true }));
  for await (const entry of zip) {
    await parseAcceFile(entry, entry.path, importDate);
    entry.autodrain();
  }
}

export async function runAcceImporter() {
  const importDate = new Date();
  const importId = new ObjectId();

  try {
    await getDbCollection("import.meta").insertOne({
      _id: importId,
      import_date: importDate,
      type: "acce",
      status: "pending",
    });

    logger.info("Geting ACCE file...");

    const stream = await downloadCsvExtraction();

    logger.info("Import ACCE data starting...");

    await importAcceData(stream, importDate);
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    throw withCause(internal("import.acce: unable to runAcceImporter"), error);
  }
}
