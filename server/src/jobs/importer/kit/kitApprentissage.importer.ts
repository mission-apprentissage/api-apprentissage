import { readdir } from "node:fs/promises";
import { Duplex, Transform } from "node:stream";

import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { addJob } from "job-processor";
import { ObjectId } from "mongodb";
import type { ImportStatus } from "shared";
import type { ISourceKitApprentissage } from "shared/models/source/kitApprentissage/source.kit_apprentissage.model";
import { pipeline } from "stream/promises";

import { withCause } from "@/services/errors/withCause.js";
import type { ExcelParsedRow, ExcelParseSpec } from "@/services/excel/excel.parser.js";
import { parseExcelFileStream } from "@/services/excel/excel.parser.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { getStaticFilePath } from "@/utils/getStaticFilePath.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

import {
  buildKitApprentissageEntry,
  buildKitApprentissageFromExcelParsedRow,
  getVersionNumber,
} from "./builder/kit_apprentissage.builder.js";

async function importKitApprentissageSourceCsv(
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

async function importKitApprentissageSourceXlsx(
  importDate: Date,
  filename: ISourceKitApprentissage["source"]
): Promise<void> {
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
            callback(null, buildKitApprentissageFromExcelParsedRow(row, filename, importDate, version));
          } catch (error) {
            callback(
              withCause(internal("import.kit_apprentissage: error when parsing row", { row, filename, version }), error)
            );
          }
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
    console.error(error);
    throw withCause(
      internal("import.kit_apprentissage: unable to importKitApprentissageSourceXlsx", { filename }),
      error
    );
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

    const files = await listKitApprentissageFiles();
    for (const file of files) {
      if (file.endsWith(".csv")) {
        await importKitApprentissageSourceCsv(importDate, file);
      } else if (file.endsWith(".xlsx")) {
        await importKitApprentissageSourceXlsx(importDate, file);
      } else {
        throw internal("import.kit_apprentissage: unsupported source file format", { file });
      }
    }

    await getDbCollection("source.kit_apprentissage").deleteMany({
      date: { $ne: importDate },
    });
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });

    await addJob({ name: "indicateurs:source_kit_apprentissage:update" });

    return await getDbCollection("source.kit_apprentissage").countDocuments({ date: importDate });
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    await getDbCollection("source.kit_apprentissage").deleteMany({ date: importDate });
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
