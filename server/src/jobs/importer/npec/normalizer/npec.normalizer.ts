import { internal } from "@hapi/boom";
import { DateTime } from "luxon";
import { AnyBulkWriteOperation, ObjectId } from "mongodb";
import { IImportMetaNpec } from "shared/models/import.meta.model";
import { ISourceNpec, ISourceNpecReferentielData } from "shared/models/source/npec/source.npec.model";
import {
  ISourceNpecNormalized,
  ISourceNpecNormalizedFlat,
  zSourceNpecNormalizedFlatData,
} from "shared/models/source/npec/source.npec.normalized.model";
import { Transform } from "stream";
import { pipeline } from "stream/promises";

import { getNpecFilename } from "@/jobs/importer/npec/scraper/npec.scraper.js";
import { withCause } from "@/services/errors/withCause.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createChangeBatchCardinalityTransformStream } from "@/utils/streamUtils.js";

export async function buildCpneIdccMap(filename: string): Promise<Map<string, Set<number>>> {
  const cpneIdccMap = new Map<string, Set<number>>();
  const cursor = getDbCollection("source.npec").find({ filename, "data.type": "cpne-idcc" });

  for await (const doc of cursor) {
    if (!doc.data.cpne_code || !doc.data.idcc) {
      throw internal("Missing cpne_code or idcc in cpne-idcc document", { doc });
    }

    if (!cpneIdccMap.has(doc.data.cpne_code)) {
      cpneIdccMap.set(doc.data.cpne_code, new Set());
    }

    const idcc = parseInt(doc.data.idcc, 10);

    if (cpneIdccMap.get(doc.data.cpne_code)!.has(idcc)) {
      throw internal("Duplicate idcc in cpne-idcc documents", { doc });
    }

    cpneIdccMap.get(doc.data.cpne_code)!.add(idcc);
  }

  return cpneIdccMap;
}

function normaliseDateApplicabilite(data: ISourceNpecReferentielData): Date | null {
  if (data.date_applicabilite) {
    return DateTime.fromJSDate(data.date_applicabilite, { zone: "UTC" })
      .setZone("Europe/Paris", { keepLocalTime: true })
      .toJSDate();
  }

  if (typeof data.procedure === "number") {
    return DateTime.fromObject(
      {
        year: data.procedure,
        month: 9,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      },
      {
        zone: "Europe/Paris",
      }
    ).toJSDate();
  }

  return null;
}

function normaliseRncpCode(rncp: string): string {
  return rncp.startsWith("RNCP") ? rncp : `RNCP${rncp}`;
}

function normalizeNpecDocument(
  cpneIdccMap: Map<string, Set<number>>,
  doc: ISourceNpec
): Array<Omit<ISourceNpecNormalizedFlat, "_id">> {
  if (doc.data.type === "cpne-idcc") {
    throw internal("Unexpected cpne-idcc document in npec collection", { doc });
  }

  const { rncp, npec, cpne_code, cpne_libelle } = doc.data;

  if (npec === null) {
    // NPEC is null when the value is not yet defined
    return [];
  }

  if (!cpne_code) {
    throw internal("Missing cpne_code in npec document", { doc });
  }

  // Some CPNE codes are not associated with any IDCC (marked as NC)
  const idcc = cpneIdccMap.get(cpne_code) ?? new Set();

  if (!rncp) {
    if (doc.data.procedure === 2019) {
      // Some diplomes where not associated with an RNCP in 2019
      return [];
    }

    throw internal("Missing rncp in npec document", { doc });
  }

  const date_applicabilite = normaliseDateApplicabilite(doc.data);

  try {
    const normalizedDocs = rncp
      .split("/")
      .filter(Boolean)
      .map((rncp) => {
        return zSourceNpecNormalizedFlatData.omit({ _id: true }).parse({
          rncp: normaliseRncpCode(rncp),
          cpne_code,
          cpne_libelle,
          npec,
          date_applicabilite,
          idcc: Array.from(idcc.values()),
          filename: doc.filename,
          date_file: doc.date_file,
          import_id: doc.import_id,
          date_import: doc.date_import,
        });
      });

    return normalizedDocs;
  } catch (error) {
    throw withCause(internal("Failed to normalize npec document", { doc }), error);
  }
}

function getNormalizeNpecDocumentOp(
  cpneIdccMap: Map<string, Set<number>>,
  doc: ISourceNpec
): AnyBulkWriteOperation<ISourceNpecNormalized>[] {
  return normalizeNpecDocument(cpneIdccMap, doc).map((normalizedDoc) => {
    const { date_import, filename, rncp, cpne_code, npec, ...rest } = normalizedDoc;

    return {
      updateOne: {
        filter: { date_import, filename, rncp, cpne_code },
        update: {
          $set: rest,
          $setOnInsert: {
            _id: new ObjectId(),
            date_import,
            filename,
            rncp,
            cpne_code,
          },
          $addToSet: {
            npec,
          },
        },
        upsert: true,
      },
    };
  });
}

export async function runNpecNormalizer(importMeta: IImportMetaNpec) {
  if (importMeta.file_date < new Date("2022-07-01T00:00:00Z")) {
    return;
  }

  const filename = getNpecFilename(importMeta.resource);

  try {
    await getDbCollection("source.npec.normalized").deleteMany({
      date_import: importMeta.import_date,
      filename,
    });

    const cpneIdccMap = await buildCpneIdccMap(filename);
    const cursor = getDbCollection("source.npec").find({ filename, "data.type": "npec" });

    await pipeline(
      cursor,
      new Transform({
        objectMode: true,
        async transform(chunk: ISourceNpec, _encoding, callback) {
          try {
            const ops = getNormalizeNpecDocumentOp(cpneIdccMap, chunk);
            callback(null, ops);
          } catch (error) {
            callback(
              withCause(
                internal("import.npec.normalizer: error when building normalised npec doc", {
                  chunk,
                  importMeta,
                }),
                error
              )
            );
          }
        },
      }),
      createChangeBatchCardinalityTransformStream({ size: 500 }),
      new Transform({
        objectMode: true,
        async transform(chunk: AnyBulkWriteOperation<ISourceNpecNormalized>[], _encoding, callback) {
          try {
            await getDbCollection("source.npec.normalized").bulkWrite(chunk);
            callback();
          } catch (error) {
            callback(withCause(internal("import.npec.normalizer: error when bulkWrite"), error));
          }
        },
      })
    );

    await getDbCollection("source.npec.normalized").deleteMany({
      date_import: { $ne: importMeta.import_date },
      filename,
    });
  } catch (error) {
    await getDbCollection("source.npec.normalized").deleteMany({
      date_import: importMeta.import_date,
      filename,
    });
    throw withCause(internal("npec.import.normalizer: unable to runNpecNormalizer", { importMeta }), error);
  }
}
