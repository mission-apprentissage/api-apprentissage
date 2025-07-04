import { addAbortSignal, Duplex, Transform } from "node:stream";

import { pipeline } from "stream/promises";
import { internal } from "@hapi/boom";
import type { AnyBulkWriteOperation } from "mongodb";
import { ObjectId } from "mongodb";
import type { IDataGouvDataset, ImportStatus } from "shared";
import { removeDiacritics } from "shared";
import type { IImportMeta } from "shared/models/import.meta.model";
import type { ISourceKaliCcn } from "shared/models/source/kali/source.kali.ccn.model";
import { zSourceKaliCcn } from "shared/models/source/kali/source.kali.ccn.model";

import { downloadDataGouvResource, fetchDataGouvDataSet } from "@/services/apis/data_gouv/data_gouv.api.js";
import { withCause } from "@/services/errors/withCause.js";
import type { ExcelParsedRow } from "@/services/excel/excel.parser.js";
import { parseExcelFileStream } from "@/services/excel/excel.parser.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

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
        parseExcelFileStream(readStream, [
          {
            type: "required",
            nameMatchers: [/^Feuil1$/],
            key: "data",
            skipRows: 3,
            columns: [
              { type: "ignore", regex: [/^\s*$/] },
              { type: "required", name: "id", regex: [/^ID$/] },
              { type: "required", name: "type", regex: [/^CC_TI$/i] },
              { type: "required", name: "idcc", regex: [/^IDCC$/i] },
              { type: "required", name: "titre", regex: [/^TITRE$/i] },
              { type: "required", name: "nature", regex: [/^NATURE$/i] },
              { type: "required", name: "etat", regex: [/^ETAT$/i] },
              { type: "required", name: "debut", regex: [/^DEBUT$/i] },
              { type: "required", name: "fin", regex: [/^FIN$/i] },
              { type: "required", name: "url", regex: [/^URL$/i] },
            ],
          },
        ])
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
    throw withCause(internal("import.kali_ccn: unable to runKaliConventionCollectivesImporter"), error, "fatal");
  }
}

export async function getKaliImporterStatus(): Promise<ImportStatus> {
  const [lastImport, lastSuccess] = await Promise.all([
    await getDbCollection("import.meta").findOne({ type: "kali_ccn" }, { sort: { import_date: -1 } }),
    await getDbCollection("import.meta").findOne({ type: "kali_ccn", status: "done" }, { sort: { import_date: -1 } }),
  ]);

  return {
    last_import: lastImport?.import_date ?? null,
    last_success: lastSuccess?.import_date ?? null,
    status: lastImport?.status ?? "pending",
    resources: [],
  };
}
