import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { ObjectId } from "mongodb";
import { ISourceBcn, zBcnBySource } from "shared/models/source/bcn/source.bcn.model";

import { fetchBcnData } from "@/common/apis/bcn/bcn";
import parentLogger from "@/common/logger";

import { withCause } from "../../../../common/errors/withCause";
import { getDbCollection } from "../../../../common/utils/mongodbUtils";
import { createBatchTransformStream } from "../../../../common/utils/streamUtils";

const logger = parentLogger.child({ module: "import:bcn" });

async function importBcnSource(source: ISourceBcn["source"], date: Date) {
  logger.info({ source }, "fetching BCN data");

  try {
    const zod = zBcnBySource[source as keyof typeof zBcnBySource] ?? null;

    if (zod === null) {
      throw internal("import.bcn: unexpected source", { source });
    }

    const stream = await fetchBcnData(source);

    logger.info({ source }, "parsing BCN data");

    await pipeline(
      stream,
      parse({
        bom: true,
        columns: true,
        relax_column_count: true,
        encoding: "latin1",
        delimiter: ";",
        trim: true,
        quote: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRecord: (record, { columns }: any) => {
          const data = columns.reduce((acc: Record<string, string | null>, column: { name: string }) => {
            // Replace all mongodb dot special character with underscore
            acc[column.name.replaceAll(".", "_")] = record[column.name]?.trim() || null;
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
      createBatchTransformStream({ size: 1_000 }),
      new Transform({
        objectMode: true,
        async transform(chunk, _encoding, callback) {
          try {
            await getDbCollection("source.bcn").insertMany(chunk);
            callback();
          } catch (error) {
            callback(withCause(internal("import.bcn: error when inserting"), error));
          }
        },
      })
    );

    await getDbCollection("source.bcn").deleteMany({
      source,
      date: { $ne: date },
    });
  } catch (error) {
    throw withCause(internal("import.bcn: unable to importBcnSource", { source }), error);
  }
}

export async function runBcnImporter() {
  const importDate = new Date();

  try {
    await importBcnSource("N_FORMATION_DIPLOME", importDate);
    await importBcnSource("N_FORMATION_DIPLOME_ENQUETE_51", importDate);
    await importBcnSource("N_NIVEAU_FORMATION_DIPLOME", importDate);
    await importBcnSource("V_FORMATION_DIPLOME", importDate);
  } catch (error) {
    throw withCause(internal("import.bcn: unable to runBcnImporter"), error);
  }
}