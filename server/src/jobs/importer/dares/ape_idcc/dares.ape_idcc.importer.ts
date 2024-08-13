import { addAbortSignal, Duplex, Transform } from "node:stream";

import { internal } from "@hapi/boom";
import { AnyBulkWriteOperation, ObjectId } from "mongodb";
import { IImportMetaDares } from "shared/models/import.meta.model";
import { ISourceDaresApeIdcc, zSourceDaresApeIdcc } from "shared/models/source/dares/source.dares.ape_idcc.model";
import { pipeline } from "stream/promises";

import { withCause } from '@/services/errors/withCause.js';
import { ExcelParsedRow, parseExcelFileStream } from '@/services/excel/excel.parser.js';
import { getDbCollection } from '@/services/mongodb/mongodbService.js';
import { createBatchTransformStream } from '@/utils/streamUtils.js';

import { downloadResourceApeIdccFile, scrapeRessourceApeIdcc } from './scraper/dares.ape_idcc.scraper.js';

async function importResource(importMeta: IImportMetaDares, signal?: AbortSignal) {
  const readStream = await downloadResourceApeIdccFile(importMeta.resource);

  if (signal) addAbortSignal(signal, readStream);

  await pipeline(
    Duplex.from(
      parseExcelFileStream(readStream, {
        "Lisez-moi": null,
        IDCC2021_passageAPEIDCC_diff: {
          key: "data",
          skipRows: 6,
          columns: [
            { name: "ape_code", regex: /^apen$/i },
            { name: "ape_intitule", regex: /^intape$/i },
            { name: "effectif", regex: /^effarrdiff$/i },
            { name: "idcc", regex: /^idcc$/i },
            { name: "titre", regex: /^intidcc$/i },
            { name: "effectif_pct", regex: /^pctdiff$/i },
          ],
        },
      })
    ),
    new Transform({
      objectMode: true,
      async transform(row: ExcelParsedRow, _encoding, callback) {
        try {
          const data = zSourceDaresApeIdcc.parse({
            _id: new ObjectId(),
            import_id: importMeta._id,
            date_import: importMeta.import_date,
            data: {
              naf: { code: row.data.ape_code, intitule: row.data.ape_intitule },
              convention_collective:
                !row.data.idcc || row.data.idcc === "Autre" ? null : { idcc: row.data.idcc, titre: row.data.titre },
            },
          });

          callback(null, { insertOne: { document: data } } as AnyBulkWriteOperation<ISourceDaresApeIdcc>);
        } catch (error) {
          callback(withCause(internal("import.dares_ape_idcc: error when inserting", { row }), error));
        }
      },
    }),
    createBatchTransformStream({ size: 500 }),
    new Transform({
      objectMode: true,
      async transform(chunk: AnyBulkWriteOperation<ISourceDaresApeIdcc>[], _encoding, callback) {
        try {
          await getDbCollection("source.dares.ape_idcc").bulkWrite(chunk, { ordered: false });
          callback();
        } catch (error) {
          callback(withCause(internal("import.dares_ape_idcc: error when inserting"), error));
        }
      },
    }),
    { signal }
  );
}

export async function runDaresApeIdccImporter(signal?: AbortSignal) {
  const importId = new ObjectId();
  const importDate = new Date();

  try {
    const resource = await scrapeRessourceApeIdcc();

    const existingImport = await getDbCollection("import.meta").findOne({
      type: "dares_ape_idcc",
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
      type: "dares_ape_idcc",
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
    throw withCause(internal("import.dares_ape_idcc: unable to runDaresApeIdccImporter"), error);
  }
}
