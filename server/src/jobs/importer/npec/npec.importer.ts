import { internal } from "@hapi/boom";
import { captureException } from "@sentry/node";
import { addJob } from "job-processor";
import { AnyBulkWriteOperation, ObjectId } from "mongodb";
import { IImportMetaNpec } from "shared/models/import.meta.model";
import { ISourceNpec, zSourceNpecIdcc } from "shared/models/source/npec/source.npec.model";
import { addAbortSignal, Duplex, Transform } from "stream";
import { pipeline } from "stream/promises";

import { withCause } from "@/services/errors/withCause";
import { ExcelParsedRow, ExcelParseSpec, parseExcelFileStream } from "@/services/excel/excel.parser";
import { getDbCollection } from "@/services/mongodb/mongodbService";
import { createBatchTransformStream } from "@/utils/streamUtils";

import { downloadXlsxNPECFile, getNpecFilename, scrapeRessourceNPEC } from "./scraper/npec.scraper";

function getWorkbookParseSpec(name: string): ExcelParseSpec {
  switch (name) {
    case "referentiel_des_npec-2-1.xlsx":
      return {
        "Lisez-moi": null,
        "Onglet 2 - global": null,
        "Onglet 3 - par formation-CPNE": {
          key: "npec",
          skipRows: 1,
          columns: [
            { name: "diplome_code", regex: /^Code la formation$/ },
            { name: "diplome_libelle", regex: /^Libellé de la formation$/i },
            { name: "cpne_libelle", regex: /^Libellé CPNE$/i },
            { name: "npec", regex: /^Valeur finale$/i },
            { name: "statut", regex: /^Statut$/i },
          ],
        },
      };
    case "vf_referentiel_avec_idcc_oct_2019.xlsx":
    case "VF_Référentiel_avec_idcc_avril2020.xlsx":
      return {
        "Lisez-moi": null,
        "Onglet 2 - global": null,
        "Onglet 3 - par formation-CPNE": {
          key: "npec",
          skipRows: 1,
          columns: [
            { name: "diplome_code", regex: /^Code la formation$/ },
            { name: "diplome_libelle", regex: /^Libellé de la formation$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Libellé CPNE$/i },
            { name: "idcc", regex: /^Code IDCC$/i },
            { name: "npec", regex: /^Valeur finale$/i },
            { name: "statut", regex: /^Statut$/i },
          ],
        },
        "Onglet 4 - CPNE-IDCC": null,
        "Onglet 5 - IDCC-CPNE": {
          key: "cpne-idcc",
          skipRows: 1,
          columns: [
            { name: "idcc", regex: /^IDCC$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Intitulé CPNE$/i },
          ],
        },
      };
    case "VF_Référentiel_avec_idcc_août2020.xlsx":
      return {
        "Lisez-moi": null,
        "Onglet 2 - global": null,
        "Onglet 3 - par formation-CPNE": {
          key: "npec",
          skipRows: 1,
          columns: [
            { name: "diplome_code", regex: /^Code diplôme$/ },
            { name: "diplome_libelle", regex: /^Libellé du Diplôme$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Libellé CPNE$/i },
            { name: "idcc", regex: /^Code IDCC$/i },
            { name: "npec", regex: /^Valeur finale$/i },
            { name: "statut", regex: /^Statut$/i },
          ],
        },
        "Onglet 4 - CPNE-IDCC": null,
        "Onglet 5 - IDCC-CPNE": {
          key: "cpne-idcc",
          skipRows: 1,
          columns: [
            { name: "idcc", regex: /^IDCC$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Intitulé CPNE$/i },
          ],
        },
      };
    case "VF_Référentiel_avec_idcc_octobre2020.xlsx":
      return {
        "Lisez-moi": null,
        "Onglet 2 - global": null,
        "Onglet 3 - par formation-CPNE": {
          key: "npec",
          skipRows: 1,
          columns: [
            { name: "rncp", regex: /^Code diplôme\/Code RNCP$/i },
            { name: "formation_libelle", regex: /^Libellé dde la certification$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Libellé CPNE$/i },
            { name: "idcc", regex: /^Code IDCC$/i },
            { name: "npec", regex: /^Valeur finale$/i },
            { name: "statut", regex: /^Statut$/i },
          ],
        },
        "Onglet 4 - CPNE-IDCC": null,
        "Onglet 5 - IDCC-CPNE": {
          key: "cpne-idcc",
          skipRows: 1,
          columns: [
            { name: "idcc", regex: /^IDCC$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Intitulé CPNE$/i },
          ],
        },
      };
    case "VF_11.02.2021_Référentiel-NPEC-20192020_avec_idcc.xlsx":
      return {
        "Lisez-moi": null,
        "Onglet 2 - par formation-CPNE": {
          key: "npec",
          skipRows: 1,
          columns: [
            { name: "diplome_code", regex: /^Code diplôme$/ },
            { name: "rncp", regex: /^Code RNCP$/i },
            { name: "formation_libelle", regex: /^Libellé de la certification$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Libellé CPNE$/i },
            { name: "idcc", regex: /^Code IDCC$/i },
            { name: "npec", regex: /^Valeur finale$/i },
            { name: "statut", regex: /^Statut$/i },
          ],
        },
        "Onglet 3 - CPNE-IDCC": null,
        "Onglet 4 - IDCC-CPNE": {
          key: "cpne-idcc",
          skipRows: 1,
          columns: [
            { name: "idcc", regex: /^IDCC$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Intitulé CPNE$/i },
          ],
        },
      };
    case "V05.10.2021_Référentiel-NPEC-201920202021.xlsx-2.zip":
    case "V14.01.2022_Référentiel-NPEC-201920202021.xlsx.zip":
    case "V03.05.2022_Référentiel-NPEC-201920202021-2.xlsx":
    case "V27.07.2022_Référentiel-NPEC-201920202021-1.xlsx.zip":
      return {
        "Lisez-moi": null,
        "Onglet 2 - global": null,
        "Onglet 3a - référentiel NPEC": {
          key: "npec",
          skipRows: 2,
          columns: [
            { name: "diplome_code", regex: /^Code diplôme$/ },
            { name: "rncp", regex: /^Code RNCP$/i },
            { name: "formation_libelle", regex: /^Libellé de la certification$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Libellé CPNE$/i },
            { name: "idcc", regex: /^IDCC$/i },
            { name: "npec", regex: /^Valeur finale$/i },
            { name: "statut", regex: /^Statut$/i },
            { name: "procedure", regex: /^Procédure$/i },
          ],
        },
        "Onglet 3b - NPEC historisées": null,
        "Onglet 4-CPNE-IDCC": null,
        "Onglet 5-IDCC-CPNE": {
          key: "cpne-idcc",
          skipRows: 2,
          columns: [
            { name: "idcc", regex: /^IDCC$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Intitulé CPNE$/i },
          ],
        },
      };

    case "VF_17.03.2021_Référentiel-NPEC-20192020_avec_idcc.xlsb.zip":
      return {
        "Lisez-moi": null,
        "Onglet 2-global": null,
        "Onglet 3-par formation-CPNE": {
          key: "npec",
          skipRows: 2,
          columns: [
            { name: "historique", regex: /^Valeur historisée \("H"\)$/i },
            { name: "diplome_code", regex: /^Code diplôme$/ },
            { name: "rncp", regex: /^Code RNCP$/i },
            { name: "formation_libelle", regex: /^Libellé de la certification$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Libellé CPNE$/i },
            { name: "idcc", regex: /^IDCC$/i },
            { name: "npec", regex: /^Valeur finale$/i },
            { name: "statut", regex: /^Statut$/i },
          ],
        },
        "Onglet 4-CPNE-IDCC": null,
        "Onglet 5-IDCC-CPNE": {
          key: "cpne-idcc",
          skipRows: 2,
          columns: [
            { name: "idcc", regex: /^IDCC$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^Intitulé CPNE$/i },
          ],
        },
      };

    case "Référentiel-NPEC-_01092022-1.zip":
      return {
        "Me lire": null,
        "Onglet 2 - global": null,
        "Onglet 3 - référentiel NPEC": {
          key: "npec",
          skipRows: 3,
          columns: [
            { name: "rncp", regex: /^Code RNCP$/i },
            { name: "formation_libelle", regex: /^Libellé de la formation$/i },
            { name: "certificateur", regex: /^Certificateur$/i },
            { name: "diplome_libelle", regex: /^Libellé du Diplôme$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^CPNE$/i },
            { name: "npec", regex: /^NPEC final$/i },
            { name: "statut", regex: /^Statut$/i },
            { name: "procedure", regex: /^procédure$/i },
          ],
        },
        "Onglet 4 - CPNE-IDCC": {
          key: "cpne-idcc",
          skipRows: 2,
          columns: [
            { name: "cpne_code", regex: /^Code CPNE/i },
            { name: "cpne_libelle", regex: /^CPNE/i },
            { name: "idcc", regex: /^IDCC/i },
          ],
        },
      };
    default:
      return {
        "Me lire": null,
        "Onglet 2 - global": null,
        "Onglet 3 - référentiel NPEC": {
          key: "npec",
          skipRows: 3,
          columns: [
            { name: "rncp", regex: /^Code RNCP$/i },
            { name: "formation_libelle", regex: /^Libellé de la formation$/i },
            { name: "certificateur", regex: /^Certificateur\*\s+/i },
            { name: "diplome_libelle", regex: /^Libellé du Diplôme$/i },
            { name: "cpne_code", regex: /^Code CPNE$/i },
            { name: "cpne_libelle", regex: /^CPNE$/i },
            { name: "npec", regex: /^NPEC final$/i },
            { name: "statut", regex: /^Statut$/i },
            { name: "date_applicabilite", regex: /^Date d'applicabilité des NPEC\*\*\s+/i },
          ],
        },
        "Onglet 4 - CPNE-IDCC": {
          key: "cpne-idcc",
          skipRows: 2,
          columns: [
            { name: "cpne_code", regex: /^Code CPNE/i },
            { name: "cpne_libelle", regex: /^CPNE/i },
            { name: "idcc", regex: /^IDCC/i },
          ],
        },
      };
  }
}

function getValue(value: unknown) {
  if (value == null) return null;
  return value === "NC" ? null : value;
}

function castNpecValue(value: unknown) {
  if (typeof value === "string") {
    if (value === "NC") {
      return null;
    }
    return value.replaceAll(/(\s|€)/gi, "");
  }

  return value;
}

export async function importNpecResource(importMeta: IImportMetaNpec, signal?: AbortSignal) {
  const filename = getNpecFilename(importMeta.resource);

  try {
    const spec = getWorkbookParseSpec(filename);

    const readStream = await downloadXlsxNPECFile(importMeta.resource);

    if (signal) addAbortSignal(signal, readStream);

    await pipeline(
      Duplex.from(parseExcelFileStream(readStream, spec)),
      new Transform({
        objectMode: true,
        async transform(row: ExcelParsedRow, _encoding, callback) {
          try {
            const data = zSourceNpecIdcc.parse({
              _id: new ObjectId(),
              filename,
              date_import: importMeta.import_date,
              date_file: importMeta.file_date,
              data:
                row.sheet === "npec"
                  ? {
                      type: "npec",
                      rncp: getValue(row.data.rncp),
                      formation_libelle: getValue(row.data.formation_libelle),
                      certificateur: getValue(row.data.certificateur),
                      diplome_code: getValue(row.data.diplome_code),
                      diplome_libelle: getValue(row.data.diplome_libelle),
                      cpne_code: getValue(row.data.cpne_code),
                      cpne_libelle: getValue(row.data.cpne_libelle),
                      npec: castNpecValue(row.data.npec),
                      statut: getValue(row.data.statut),
                      date_applicabilite: getValue(row.data.date_applicabilite),
                      procedure: getValue(row.data.procedure),
                      idcc: getValue(row.data.idcc),
                    }
                  : {
                      type: "cpne-idcc",
                      idcc: getValue(row.data.idcc),
                      cpne_code: getValue(row.data.cpne_code),
                      cpne_libelle: getValue(row.data.cpne_libelle),
                    },
            });

            callback(null, { insertOne: { document: data } } as AnyBulkWriteOperation<ISourceNpec>);
          } catch (error) {
            callback(withCause(internal("import.npec: error when inserting", { row }), error));
          }
        },
      }),
      createBatchTransformStream({ size: 500 }),
      new Transform({
        objectMode: true,
        async transform(chunk: AnyBulkWriteOperation<ISourceNpec>[], _encoding, callback) {
          try {
            await getDbCollection("source.npec").bulkWrite(chunk, { ordered: false });
            callback();
          } catch (error) {
            callback(withCause(internal("import.npec: error when inserting"), error));
          }
        },
      }),
      { signal }
    );

    const [npecCount, cpneIdccCount] = await Promise.all([
      getDbCollection("source.npec").countDocuments({ date_import: importMeta.import_date, "data.type": "npec" }),
      getDbCollection("source.npec").countDocuments({ date_import: importMeta.import_date, "data.type": "cpne-idcc" }),
    ]);

    await getDbCollection("source.npec").deleteMany({
      date_import: { $ne: importMeta.import_date },
      filename,
    });

    await getDbCollection("import.meta").updateOne(
      { _id: importMeta._id },
      {
        $set: {
          status: "done",
        },
      }
    );

    return { npecCount, cpneIdccCount };
  } catch (error) {
    if (signal && error.name === signal?.reason?.name) {
      throw signal.reason;
    }
    await getDbCollection("source.npec").deleteMany({
      date_import: importMeta.import_date,
      filename,
    });
    throw withCause(internal("npec.import: unable to importNpecResource", { importMeta }), error);
  }
}

export async function onImportNpecResourceFailure(importMeta: IImportMetaNpec) {
  try {
    await getDbCollection("import.meta").updateOne({ _id: importMeta._id }, { $set: { status: "failed" } });
  } catch (error) {
    throw withCause(internal("npec.import: unable to update import_meta status", { importMeta }), error);
  }
}

async function getUnprocessedImportMeta(resources: { url: string; date: Date }[]): Promise<{
  added: IImportMetaNpec[];
  retry: IImportMetaNpec[];
}> {
  try {
    const todo = new Map(resources.map((r) => [r.url, r.date]));

    const existingMeta = await getDbCollection("import.meta").find<IImportMetaNpec>({ type: "npec" }).toArray();

    const retry: IImportMetaNpec[] = [];

    for (const meta of existingMeta) {
      if (todo.has(meta.resource)) {
        todo.delete(meta.resource);

        if (meta.status === "failed") {
          retry.push(meta);
        } else if (meta.status === "pending") {
          captureException(internal("npec.importer: found an import meta for a resource that is still pending"));
        }
      } else {
        captureException(internal("npec.importer: found an import meta for a resource that is not in the dataset"));
      }
    }

    const added = Array.from(todo.entries()).map(([resource, date]): IImportMetaNpec => {
      return {
        _id: new ObjectId(),
        import_date: new Date(),
        type: "npec",
        status: "pending",
        resource,
        file_date: date,
      };
    }, []);

    return {
      retry,
      added,
    };
  } catch (error) {
    throw withCause(internal("npec.importer: unable to getUnprocessedImportMeta"), error);
  }
}

export async function runNpecImporter() {
  try {
    const resources = await scrapeRessourceNPEC();

    const importMetas = await getUnprocessedImportMeta(resources);

    for (const importMeta of importMetas.added) {
      await addJob({ name: "import:npec:resource", payload: importMeta, queued: true });
      await getDbCollection("import.meta").insertOne(importMeta);
    }
    for (const importMeta of importMetas.retry) {
      await addJob({ name: "import:npec:resource", payload: { ...importMeta, status: "pending" }, queued: true });
      await getDbCollection("import.meta").updateOne({ _id: importMeta._id }, { $set: { status: "pending" } });
    }
  } catch (error) {
    throw withCause(internal("npec.importer: error while running importer"), error);
  }
}
