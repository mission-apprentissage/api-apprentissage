import { readdir } from "node:fs/promises";
import { Duplex, Transform, Writable } from "node:stream";

import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { addJob } from "job-processor";
import { ObjectId } from "mongodb";
import type { ImportStatus } from "shared";

import logger from "../../../services/logger.js";
import {
  buildKitApprentissageEntry,
  buildKitApprentissageOp,
  getVersionNumber,
} from "./builder/kit_apprentissage.builder.js";
import { getKitApprentissageData } from "@/services/apis/kit_apprentissage/kit_apprentissage.api.js";
import { withCause } from "@/services/errors/withCause.js";
import type { ExcelParsedRow, ExcelParseSpec } from "@/services/excel/excel.parser.js";
import { parseExcelFileStream } from "@/services/excel/excel.parser.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { getStaticFilePath } from "@/utils/getStaticFilePath.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

function createBuildBulkOpAndWriteStreams(): [Transform, Transform, Writable] {
  return [
    new Transform({
      objectMode: true,
      async transform(
        row: {
          cfd: string | null;
          rncp: string | null;
        },
        _encoding,
        callback
      ) {
        try {
          const op = buildKitApprentissageOp(row);
          if (op === null) {
            callback();
            return;
          }
          callback(null, op);
        } catch (error) {
          callback(withCause(internal("import.kit_apprentissage: error when building operation", { row }), error));
        }
      },
    }),
    createBatchTransformStream({ size: 100 }),
    new Writable({
      objectMode: true,
      async write(chunk, _encoding, callback) {
        try {
          const ops = chunk.filter((op: unknown) => op !== null);
          if (ops.length > 0) {
            await getDbCollection("source.kit_apprentissage").bulkWrite(ops);
          }
          callback();
        } catch (error) {
          callback(withCause(internal("import.kit_apprentissage: error when updating"), error));
        }
      },
    }),
  ];
}

async function importKitApprentissageSourceCsv(filename: string): Promise<void> {
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
        onRecord: buildKitApprentissageEntry,
      }),
      ...createBuildBulkOpAndWriteStreams()
    );
  } catch (error) {
    throw withCause(
      internal("import.kit_apprentissage: unable to importKitApprentissageSourceCsv", { filename }),
      error
    );
  }
}

function getExcelParserSpec(): ExcelParseSpec {
  return [
    {
      key: "kit",
      skipRows: 1,
      columns: "auto",
      nameMatchers: [/Kit Apprentissage/i],
      type: "required",
    },
    {
      type: "ignore",
      nameMatchers: [
        /Présentation Kit/i,
        /Corrections Kit/i,
        /Alerte CFD CS/i,
        /Évolutions Kit/i,
        /Evolutions Kit/i,
        /^Feuil1$/i,
      ],
    },
  ];
}

async function importKitApprentissageSourceXlsx(filename: string): Promise<void> {
  try {
    const version = getVersionNumber(filename);

    await pipeline(
      Duplex.from(
        parseExcelFileStream(createReadStream(getStaticFilePath(`kit_apprentissage/${filename}`)), getExcelParserSpec())
      ),
      new Transform({
        objectMode: true,
        async transform(row: ExcelParsedRow, _encoding, callback) {
          try {
            callback(null, buildKitApprentissageEntry(row.data));
          } catch (error) {
            callback(
              withCause(internal("import.kit_apprentissage: error when parsing row", { row, filename, version }), error)
            );
          }
        },
      }),
      ...createBuildBulkOpAndWriteStreams()
    );
  } catch (error) {
    throw withCause(
      internal("import.kit_apprentissage: unable to importKitApprentissageSourceXlsx", { filename }),
      error
    );
  }
}

async function importKitApprentissageSourceApi(): Promise<void> {
  try {
    await pipeline(getKitApprentissageData(), ...createBuildBulkOpAndWriteStreams());
  } catch (error) {
    throw withCause(internal("import.kit_apprentissage: unable to importKitApprentissageSourceApi", {}), error);
  }
}

async function listKitApprentissageFiles(): Promise<string[]> {
  return await readdir(getStaticFilePath("kit_apprentissage"));
}

export async function runKitApprentissageImporter(): Promise<number> {
  const importDate = new Date();
  const importId = new ObjectId();

  try {
    await getDbCollection("import.meta").insertOne({
      _id: importId,
      import_date: importDate,
      type: "kit_apprentissage",
      status: "pending",
    });

    // Kit apprentissage data prior to 2024-06-30 is stored in files
    const files = await listKitApprentissageFiles();

    logger.info(`import.kit_apprentissage: starting import at ${importDate.toISOString()}`);
    logger.info(`import.kit_apprentissage: found ${files.length} source files to import`);

    for (const file of files) {
      logger.info(`import.kit_apprentissage: importing source file ${file}`);
      if (file.endsWith(".csv")) {
        await importKitApprentissageSourceCsv(file);
      } else if (file.endsWith(".xlsx")) {
        await importKitApprentissageSourceXlsx(file);
      } else if (file !== ".gitkeep") {
        throw internal("import.kit_apprentissage: unsupported source file format", { file });
      }
    }

    await importKitApprentissageSourceApi();

    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });

    await addJob({ name: "indicateurs:source_kit_apprentissage:update" });

    return await getDbCollection("source.kit_apprentissage").countDocuments();
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    throw withCause(internal("import.kit_apprentissage: unable to runKitApprentissageImporter"), error, "fatal");
  }
}

export async function getKitApprentissageImporterStatus(): Promise<ImportStatus> {
  const [lastImport, lastSuccess] = await Promise.all([
    await getDbCollection("import.meta").findOne({ type: "kit_apprentissage" }, { sort: { import_date: -1 } }),
    await getDbCollection("import.meta").findOne(
      { type: "kit_apprentissage", status: "done" },
      { sort: { import_date: -1 } }
    ),
  ]);

  return {
    last_import: lastImport?.import_date ?? null,
    last_success: lastSuccess?.import_date ?? null,
    status: lastImport?.status ?? "pending",
    resources: [],
  };
}
