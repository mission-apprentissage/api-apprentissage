import { addAbortSignal, Duplex, Transform } from "node:stream";

import { internal } from "@hapi/boom";
import { AnyBulkWriteOperation, ObjectId } from "mongodb";
import { IDataGouvDataset, removeDiacritics } from "shared";
import { IImportMeta } from "shared/models/import.meta.model";
import { ISourceKaliCcn, zSourceKaliCcn } from "shared/models/source/kali/source.kali.ccn.model";
import { pipeline } from "stream/promises";

import { downloadDataGouvResource, fetchDataGouvDataSet } from '@/services/apis/data_gouv/data_gouv.api.js';
import { withCause } from '@/services/errors/withCause.js';
import { ExcelParsedRow, parseExcelFileStream } from '@/services/excel/excel.parser.js';
import { getDbCollection } from '@/services/mongodb/mongodbService.js';
import { createBatchTransformStream } from '@/utils/streamUtils.js';

function getNormalizedEnumValue(value: unknown): unknown {
  if (typeof value === "string") {
    return removeDiacritics(value).toUpperCase();
  }
  return value;
}

async function importResource(
  importMeta: IImportMeta,
  resource: IDataGouvDataset["resources"][number],
  signal?: AbortSignal
) {
  try {
    const readStream = await downloadDataGouvResource(resource);

    if (signal) addAbortSignal(signal, readStream);

    await pipeline(
      Duplex.from(
        parseExcelFileStream(readStream, {
          Feuil1: {
            key: "data",
            skipRows: 3,
            columns: [
              null,
              { name: "id", regex: /^ID$/ },
              { name: "type", regex: /^CC_TI$/i },
              { name: "idcc", regex: /^IDCC$/i },
              { name: "titre", regex: /^TITRE$/i },
              { name: "nature", regex: /^NATURE$/i },
              { name: "etat", regex: /^ETAT$/i },
              { name: "debut", regex: /^DEBUT$/i },
              { name: "fin", regex: /^FIN$/i },
              { name: "url", regex: /^URL$/i },
            ],
          },
        })
      ),
      new Transform({
        objectMode: true,
        async transform(row: ExcelParsedRow, _encoding, callback) {
          try {
            const { etat, nature, ...rest } = row.data;

            const data = zSourceKaliCcn.parse({
              _id: new ObjectId(),
              date_import: importMeta.import_date,
              data: {
                etat: getNormalizedEnumValue(etat),
                nature: getNormalizedEnumValue(nature),
                ...rest,
              },
            });

            callback(null, { insertOne: { document: data } } as AnyBulkWriteOperation<ISourceKaliCcn>);
          } catch (error) {
            callback(withCause(internal("import.kali_ccn: error when inserting", { row }), error));
          }
        },
      }),
      createBatchTransformStream({ size: 500 }),
      new Transform({
        objectMode: true,
        async transform(chunk: AnyBulkWriteOperation<ISourceKaliCcn>[], _encoding, callback) {
          try {
            await getDbCollection("source.kali.ccn").bulkWrite(chunk, { ordered: false });
            callback();
          } catch (error) {
            callback(withCause(internal("import.kali_ccn: error when inserting"), error));
          }
        },
      }),
      { signal }
    );

    await getDbCollection("source.kali.ccn").deleteMany({
      date_import: { $lt: importMeta.import_date },
    });

    await getDbCollection("import.meta").updateOne(
      { _id: importMeta._id },
      {
        $set: {
          status: "done",
        },
      }
    );
  } catch (error) {
    await getDbCollection("source.kali.ccn").deleteMany({
      date_import: importMeta.import_date,
    });

    if (signal && error.name === signal?.reason?.name) {
      throw signal.reason;
    }
    throw withCause(internal("import.kali_ccn: unable to importResource", { importMeta }), error);
  }
}

export async function runKaliConventionCollectivesImporter(signal?: AbortSignal) {
  const importId = new ObjectId();
  const importDate = new Date();

  try {
    const importMeta: IImportMeta = {
      _id: importId,
      import_date: importDate,
      type: "kali_ccn",
      status: "pending",
    };

    await getDbCollection("import.meta").insertOne(importMeta);

    const dataset = await fetchDataGouvDataSet("53ba5033a3a729219b7bead9");
    const resource = dataset.resources.find((r) => r.id === "02b67492-5243-44e8-8dd1-0cb3f90f35ff") ?? null;

    if (!resource) throw internal("import.kali_ccn: unable to find resource", { dataset });

    await importResource(importMeta, resource, signal);

    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    throw withCause(internal("import.kali_ccn: unable to runKaliConventionCollectivesImporter"), error);
  }
}
