import { addAbortSignal, Duplex, Transform } from "node:stream";

import { internal } from "@hapi/boom";
import { AnyBulkWriteOperation, ObjectId } from "mongodb";
import { IImportMetaDares } from "shared/models/import.meta.model";
import { ISourceDaresCcn, zSourceDaresCcn } from "shared/models/source/dares/source.dares.ccn.model";
import { pipeline } from "stream/promises";

import { withCause } from "@/services/errors/withCause.js";
import { ExcelParsedRow, parseExcelFileStream } from "@/services/excel/excel.parser.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

import { downloadResourceCcnFile, scrapeRessourceCcn } from "./scraper/dares.ccn.scraper.js";

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
    throw withCause(internal("import.dares_ccn: unable to runDaresConventionCollectivesImporter"), error);
  }
}
