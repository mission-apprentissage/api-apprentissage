import { addAbortSignal, Duplex, Transform } from "node:stream";

import { pipeline } from "stream/promises";
import { internal } from "@hapi/boom";
import type { AnyBulkWriteOperation } from "mongodb";
import { ObjectId } from "mongodb";
import type { ImportStatus } from "shared";
import type { IImportMetaDares } from "shared/models/import.meta.model";
import type { ISourceDaresCcn } from "shared/models/source/dares/source.dares.ccn.model";
import { zSourceDaresCcn } from "shared/models/source/dares/source.dares.ccn.model";

import { downloadResourceCcnFile, scrapeRessourceCcn } from "./scraper/dares.ccn.scraper.js";
import { withCause } from "@/services/errors/withCause.js";
import type { ExcelParsedRow } from "@/services/excel/excel.parser.js";
import { parseExcelFileStream } from "@/services/excel/excel.parser.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

async function importResource(importMeta: IImportMetaDares, signal?: AbortSignal) {
  const readStream = await downloadResourceCcnFile(importMeta.resource);

  if (signal) addAbortSignal(signal, readStream);

  await pipeline(
    Duplex.from(
      parseExcelFileStream(readStream, [
        {
          type: "required",
          nameMatchers: [/^Liste IDCC-Publication$/i],
          key: "data",
          skipRows: 3,
          columns: [
            { type: "required", name: "idcc", regex: [/^IDCC$/i] },
            { type: "required", name: "titre", regex: [/^TITRE DE LA CONVENTION$/i] },
          ],
        },
        {
          type: "ignore",
          nameMatchers: [/^Feuil2$/i],
        },
      ])
    ),
    new Transform({
      objectMode: true,
      async transform(row: ExcelParsedRow, _encoding, callback) {
        try {
          const data = zSourceDaresCcn.parse({
            _id: new ObjectId(),
            import_id: importMeta._id,
            date_import: importMeta.import_date,
            data: row.data,
          });

          callback(null, { insertOne: { document: data } } as AnyBulkWriteOperation<ISourceDaresCcn>);
        } catch (error) {
          callback(withCause(internal("import.dares_ccn: error when inserting", { row }), error));
        }
      },
    }),
    createBatchTransformStream({ size: 500 }),
    new Transform({
      objectMode: true,
      async transform(chunk: AnyBulkWriteOperation<ISourceDaresCcn>[], _encoding, callback) {
        try {
          await getDbCollection("source.dares.ccn").bulkWrite(chunk, { ordered: false });
          callback();
        } catch (error) {
          callback(withCause(internal("import.dares_ccn: error when inserting"), error));
        }
      },
    }),
    { signal }
  );
}

export async function runDaresConventionCollectivesImporter(signal?: AbortSignal) {
  const importId = new ObjectId();
  const importDate = new Date();

  try {
    const resource = await scrapeRessourceCcn();

    const existingImport = await getDbCollection("import.meta").findOne({
      type: "dares_ccn",
      status: { $ne: "failed" },
      "resource.url": resource.url,
      "resource.date": { $gte: resource.date },
    });

    if (existingImport !== null) {
      return;
    }

    const importMeta: IImportMetaDares = {
      _id: importId,
      import_date: importDate,
      type: "dares_ccn",
      status: "pending",
      resource,
    };

    await getDbCollection("import.meta").insertOne(importMeta);

    await importResource(importMeta, signal);

    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    await getDbCollection("source.dares.ccn").deleteMany({
      import_id: importId,
    });
    if (signal && error.name === signal?.reason?.name) {
      throw signal.reason;
    }
    throw withCause(internal("import.dares_ccn: unable to runDaresConventionCollectivesImporter"), error, "fatal");
  }
}

export async function getDaresCcnImporterStatus(): Promise<ImportStatus> {
  const [lastImport, lastSuccess] = await Promise.all([
    await getDbCollection("import.meta").findOne({ type: "dares_ccn" }, { sort: { import_date: -1 } }),
    await getDbCollection("import.meta").findOne({ type: "dares_ccn", status: "done" }, { sort: { import_date: -1 } }),
  ]);

  return {
    last_import: lastImport?.import_date ?? null,
    last_success: lastSuccess?.import_date ?? null,
    status: lastImport?.status ?? "pending",
    resources: [],
  };
}
