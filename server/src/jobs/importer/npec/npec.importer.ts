import { internal } from "@hapi/boom";
import { captureException } from "@sentry/node";
import { addJob } from "job-processor";
import { AnyBulkWriteOperation, ObjectId } from "mongodb";
import { IImportMetaNpec } from "shared/models/import.meta.model";
import { ISourceNpec, zSourceNpecIdcc } from "shared/models/source/npec/source.npec.model";
import { addAbortSignal, Duplex, Transform } from "stream";
import { pipeline } from "stream/promises";

import { withCause } from "@/services/errors/withCause.js";
import { ExcelParsedRow, ExcelParseSpec, parseExcelFileStream } from "@/services/excel/excel.parser.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

import { runNpecNormalizer } from "./normalizer/npec.normalizer.js";
import { downloadXlsxNPECFile, getNpecFilename, scrapeRessourceNPEC } from "./scraper/npec.scraper.js";

function getWorkbookParseSpec(name: string): ExcelParseSpec {
  const ignoredSheets = {
    type: "ignore",
    nameMatchers: [/^Lisez-moi$/i, /^Me lire$/i, /^Onglet\s*2\s*-\s*global$/i, /^Onglet\s*\d+\s*-\s*CPNE-IDCC$/i],
  } as const;

  const idccCpneSheet = {
    type: "required",
    nameMatchers: [/^Onglet\s*\d\s*-\s*IDCC-CPNE$/i],
    key: "cpne-idcc",
    skipRows: 1,
    columns: [
      { type: "required", name: "idcc", regex: [/^IDCC/i] },
      { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
      { type: "optional", name: "cpne_libelle", regex: [/^Intitulé CPNE$/i, /^CPNE/i] },
    ],
  } as const;

  const cpneIdccSheet = {
    ...idccCpneSheet,
    skipRows: 2,
    nameMatchers: [/^Onglet\s*\d\s*-\s*CPNE-IDCC$/i],
  } as const;

  switch (name) {
    case "referentiel_des_npec-2-1.xlsx":
      return [
        {
          type: "required",
          key: "npec",
          skipRows: 1,
          nameMatchers: [/^Onglet 3 - par formation-CPNE$/i],
          columns: [
            { type: "optional", name: "diplome_code", regex: [/^Code la formation$/] },
            { type: "optional", name: "diplome_libelle", regex: [/^Libellé de la formation$/i] },
            { type: "required", name: "cpne_libelle", regex: [/^Libellé CPNE$/i] },
            { type: "required", name: "npec", regex: [/^Valeur finale$/i] },
            { type: "optional", name: "statut", regex: [/^Statut$/i] },
          ],
        },
        ignoredSheets,
      ];
    case "vf_referentiel_avec_idcc_oct_2019.xlsx":
    case "VF_Référentiel_avec_idcc_avril2020.xlsx":
    case "VF_Référentiel_avec_idcc_août2020.xlsx":
      return [
        {
          type: "required",
          key: "npec",
          skipRows: 1,
          nameMatchers: [/^Onglet 3 - par formation-CPNE$/i],
          columns: [
            { type: "optional", name: "diplome_code", regex: [/^Code la formation$/, /^Code diplôme$/] },
            {
              type: "optional",
              name: "diplome_libelle",
              regex: [/^Libellé de la formation$/i, /^Libellé du Diplôme$/i],
            },
            { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
            { type: "required", name: "cpne_libelle", regex: [/^Libellé CPNE$/i] },
            { type: "required", name: "idcc", regex: [/^Code IDCC$/i] },
            { type: "required", name: "npec", regex: [/^Valeur finale$/i] },
            { type: "optional", name: "statut", regex: [/^Statut$/i] },
          ],
        },
        idccCpneSheet,
        ignoredSheets,
      ];

    case "VF_Référentiel_avec_idcc_octobre2020.xlsx":
      return [
        {
          type: "required",
          nameMatchers: [/^Onglet 3 - par formation-CPNE$/i],
          key: "npec",
          skipRows: 1,
          columns: [
            { type: "required", name: "rncp", regex: [/^Code diplôme\/Code RNCP$/i] },
            { type: "optional", name: "formation_libelle", regex: [/^Libellé dde la certification$/i] },
            { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
            { type: "required", name: "cpne_libelle", regex: [/^Libellé CPNE$/i] },
            { type: "required", name: "idcc", regex: [/^Code IDCC$/i] },
            { type: "required", name: "npec", regex: [/^Valeur finale$/i] },
            { type: "optional", name: "statut", regex: [/^Statut$/i] },
          ],
        },
        idccCpneSheet,
        ignoredSheets,
      ];

    case "VF_11.02.2021_Référentiel-NPEC-20192020_avec_idcc.xlsx":
      return [
        {
          type: "required",
          nameMatchers: [/^Onglet 2 - par formation-CPNE$/i],
          key: "npec",
          skipRows: 1,
          columns: [
            { type: "optional", name: "diplome_code", regex: [/^Code diplôme$/] },
            { type: "required", name: "rncp", regex: [/^Code RNCP$/i] },
            { type: "optional", name: "formation_libelle", regex: [/^Libellé de la certification$/i] },
            { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
            { type: "required", name: "cpne_libelle", regex: [/^Libellé CPNE$/i] },
            { type: "required", name: "idcc", regex: [/^Code IDCC$/i] },
            { type: "required", name: "npec", regex: [/^Valeur finale$/i] },
            { type: "optional", name: "statut", regex: [/^Statut$/i] },
          ],
        },
        idccCpneSheet,
        ignoredSheets,
      ];
    case "V05.10.2021_Référentiel-NPEC-201920202021.xlsx-2.zip":
    case "V14.01.2022_Référentiel-NPEC-201920202021.xlsx.zip":
    case "V03.05.2022_Référentiel-NPEC-201920202021-2.xlsx":
    case "V27.07.2022_Référentiel-NPEC-201920202021-1.xlsx.zip":
      return [
        {
          type: "required",
          nameMatchers: [/^Onglet 3a - référentiel NPEC$/i],
          key: "npec",
          skipRows: 2,
          columns: [
            { type: "optional", name: "diplome_code", regex: [/^Code diplôme$/] },
            { type: "required", name: "rncp", regex: [/^Code RNCP$/i] },
            { type: "optional", name: "formation_libelle", regex: [/^Libellé de la certification$/i] },
            { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
            { type: "required", name: "cpne_libelle", regex: [/^Libellé CPNE$/i] },
            { type: "required", name: "idcc", regex: [/^IDCC$/i] },
            { type: "required", name: "npec", regex: [/^Valeur finale$/i] },
            { type: "optional", name: "statut", regex: [/^Statut$/i] },
            { type: "required", name: "procedure", regex: [/^Procédure$/i] },
          ],
        },
        {
          type: "required",
          nameMatchers: [/^Onglet 3b - NPEC historisées$/i],
          key: "npec",
          skipRows: 2,
          columns: [
            { type: "optional", name: "historique", regex: [/^NPEC historisée \("H"\)$/i] },
            { type: "optional", name: "diplome_code", regex: [/^Code diplôme$/] },
            { type: "required", name: "rncp", regex: [/^Code RNCP$/i] },
            { type: "optional", name: "formation_libelle", regex: [/^Libellé de la certification$/i] },
            { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
            { type: "required", name: "cpne_libelle", regex: [/^Libellé CPNE$/i] },
            { type: "required", name: "idcc", regex: [/^IDCC$/i] },
            { type: "required", name: "npec", regex: [/^Valeur finale$/i] },
            { type: "optional", name: "statut", regex: [/^Statut$/i] },
            { type: "required", name: "procedure", regex: [/^Procédure$/i] },
          ],
        },
        idccCpneSheet,
        ignoredSheets,
      ];

    case "VF_17.03.2021_Référentiel-NPEC-20192020_avec_idcc.xlsb.zip":
      return [
        {
          type: "required",
          nameMatchers: [/^Onglet 3-par formation-CPNE$/i],
          key: "npec",
          skipRows: 2,
          columns: [
            { type: "optional", name: "historique", regex: [/^Valeur historisée \("H"\)$/i] },
            { type: "optional", name: "diplome_code", regex: [/^Code diplôme$/] },
            { type: "required", name: "rncp", regex: [/^Code RNCP$/i] },
            { type: "optional", name: "formation_libelle", regex: [/^Libellé de la certification$/i] },
            { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
            { type: "required", name: "cpne_libelle", regex: [/^Libellé CPNE$/i] },
            { type: "required", name: "idcc", regex: [/^IDCC$/i] },
            { type: "required", name: "npec", regex: [/^Valeur finale$/i] },
            { type: "optional", name: "statut", regex: [/^Statut$/i] },
          ],
        },
        idccCpneSheet,
        ignoredSheets,
      ];

    case "Référentiel-NPEC-_01092022-1.zip":
      return [
        {
          type: "required",
          nameMatchers: [/^Onglet 3 - référentiel NPEC$/i],
          key: "npec",
          skipRows: 3,
          columns: [
            { type: "required", name: "rncp", regex: [/^Code RNCP$/i] },
            { type: "optional", name: "formation_libelle", regex: [/^Libellé de la formation$/i] },
            { type: "optional", name: "certificateur", regex: [/^Certificateur$/i] },
            { type: "optional", name: "diplome_libelle", regex: [/^Libellé du Diplôme$/i] },
            { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
            { type: "required", name: "cpne_libelle", regex: [/^CPNE$/i] },
            { type: "required", name: "npec", regex: [/^NPEC final$/i] },
            { type: "optional", name: "statut", regex: [/^Statut$/i] },
            { type: "required", name: "procedure", regex: [/^procédure$/i] },
          ],
        },
        cpneIdccSheet,
        ignoredSheets,
      ];
    default:
      return [
        {
          type: "required",
          nameMatchers: [/^Onglet 3 - référentiel NPEC$/i],
          key: "npec",
          skipRows: 3,
          columns: [
            { type: "required", name: "rncp", regex: [/^(Code )?RNCP$/i] },
            { type: "optional", name: "formation_libelle", regex: [/^Libellé de la formation$/i] },
            { type: "optional", name: "certificateur", regex: [/^Certificateur\*\s+/i] },
            { type: "optional", name: "diplome_libelle", regex: [/^Libellé du Diplôme$/i, /^Type de diplôme$/i] },
            { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
            { type: "required", name: "cpne_libelle", regex: [/^CPNE$/i] },
            { type: "required", name: "npec", regex: [/^NPEC final$/i] },
            { type: "optional", name: "statut", regex: [/^Statut$/i] },
            { type: "required", name: "date_applicabilite", regex: [/^Date d'applicabilité des NPEC\*\*\s+/i] },
          ],
        },
        cpneIdccSheet,
        ignoredSheets,
      ];
  }
}

function getValue(value: unknown) {
  if (value == null) return null;
  return value === "NC" || value === "NR" ? null : value;
}

function castNpecValue(value: unknown) {
  if (typeof value === "string") {
    if (value === "NC" || value === "NR") {
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

    await getDbCollection("source.npec").deleteMany({
      date_import: importMeta.import_date,
      filename,
    });

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
              import_id: importMeta._id,
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

    await runNpecNormalizer(importMeta);

    const [npecCount, cpneIdccCount, npecNormalizedCount] = await Promise.all([
      getDbCollection("source.npec").countDocuments({ date_import: importMeta.import_date, "data.type": "npec" }),
      getDbCollection("source.npec").countDocuments({ date_import: importMeta.import_date, "data.type": "cpne-idcc" }),
      getDbCollection("source.npec.normalized").countDocuments({ date_import: importMeta.import_date }),
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

    return { npecCount, cpneIdccCount, npecNormalizedCount };
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

async function getUnprocessedImportMeta(
  resources: { url: string; date: Date; title: string; description: string }[]
): Promise<{
  added: IImportMetaNpec[];
  retry: IImportMetaNpec[];
}> {
  try {
    const todo = new Map(resources.map((r) => [r.url, r]));

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
        captureException(
          internal("npec.importer: found an import meta for a resource that is not in the dataset", { meta })
        );
      }
    }

    const added = Array.from(todo.entries()).map(([resource, r]): IImportMetaNpec => {
      return {
        _id: new ObjectId(),
        import_date: new Date(),
        type: "npec",
        status: "pending",
        title: r.title,
        description: r.description,
        resource,
        file_date: r.date,
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
