import { addAbortSignal, Transform } from "node:stream";

import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { addJob } from "job-processor";
import { AnyBulkWriteOperation, ObjectId } from "mongodb";
import { IDataGouvDataset, IDataGouvDatasetResource } from "shared";
import { IArchiveMeta, IImportMetaFranceCompetence } from "shared/models/import.meta.model";
import { ISourceFcStandard } from "shared/models/source/france_competence/parts/source.france_competence.standard.model";
import {
  ISourceFranceCompetence,
  ISourceFranceCompetenceDataPart,
  zFranceCompetenceDataBySource,
} from "shared/models/source/france_competence/source.france_competence.model";
import { parisTimezoneDate } from "shared/zod/date.primitives";
import { pipeline } from "stream/promises";
import unzipper, { Entry } from "unzipper";

import { downloadDataGouvResource, fetchDataGouvDataSet } from "@/services/apis/data_gouv/data_gouv.api";
import { withCause } from "@/services/errors/withCause";
import { getDbCollection } from "@/services/mongodb/mongodbService";
import { createChangeBatchCardinalityTransformStream } from "@/utils/streamUtils";

type FichierMeta = {
  source: keyof ISourceFranceCompetence["data"];
};

function getFichierMetaFromFilename(entry: Entry): FichierMeta {
  // Normalise to prevent diacritics issues
  const filename = entry.path.normalize();
  if (/^export_fiches_CSV_Blocs_De_Compétences_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "blocs_de_competences" };
  }
  if (/^export_fiches_CSV_CCN_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "ccn" };
  }
  if (/^export_fiches_CSV_Partenaires_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "partenaires" };
  }
  if (/^export_fiches_CSV_Nsf_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "nsf" };
  }
  if (/^export_fiches_CSV_Formacode_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "formacode" };
  }
  if (/^export_fiches_CSV_Ancienne_Nouvelle_Certification_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "ancienne_nouvelle_certification" };
  }
  if (/^export_fiches_CSV_VoixdAccès_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "voies_d_acces" };
  }
  if (/^export_fiches_CSV_Rome_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "rome" };
  }
  if (/^export_fiches_CSV_Certificateurs_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "certificateurs" };
  }
  if (/^export_fiches_CSV_Standard_\d{4}_\d{2}_\d{2}\.csv/.test(filename)) {
    return { source: "standard" };
  }

  console.log(filename);

  throw internal("import.france_competence: unexpected filename", { filename });
}

function getArchiveMeta(resource: IDataGouvDatasetResource): IArchiveMeta | null {
  const match = resource.title.match(/^export-fiches-csv-(\d{4})-(\d{2})-(\d{2})\.zip/);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  return {
    date_publication: parisTimezoneDate({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: 0,
      minute: 0,
      second: 0,
    }),
    last_updated: new Date(resource.last_modified),
    nom: resource.title,
    resource,
  };
}

export function processRecord(
  importMeta: IImportMetaFranceCompetence,
  fichierMeta: FichierMeta,
  record: Record<string, string | null>,
  columns: { name: string }[]
): AnyBulkWriteOperation<ISourceFranceCompetence>[] {
  const rawData = columns.reduce((acc: Record<string, string | null>, column: { name: string }) => {
    acc[column.name] = record[column.name]?.trim() || null;
    return acc;
  }, {});

  const zod = zFranceCompetenceDataBySource[fichierMeta.source];
  const data: ISourceFranceCompetenceDataPart = zod.parse(rawData);

  const operations: AnyBulkWriteOperation<ISourceFranceCompetence>[] = [];

  const initialData: ISourceFranceCompetence["data"] = {
    ccn: [],
    partenaires: [],
    blocs_de_competences: [],
    nsf: [],
    formacode: [],
    ancienne_nouvelle_certification: [],
    voies_d_acces: [],
    rome: [],
    certificateurs: [],
    standard: null,
  };

  const initialDoc: Omit<ISourceFranceCompetence, "numero_fiche"> = {
    _id: new ObjectId(),
    created_at: importMeta.import_date,
    updated_at: importMeta.import_date,
    active: null,
    date_premiere_publication: null,
    date_derniere_publication: null,
    date_premiere_activation: null,
    date_derniere_activation: null,
    source: "rncp",
    data: initialData,
  };

  operations.push({
    updateOne: {
      filter: { numero_fiche: data.Numero_Fiche },
      update: {
        $setOnInsert: initialDoc,
      },
      upsert: true,
    },
  });

  if (fichierMeta.source === "standard") {
    operations.push({
      updateOne: {
        filter: { numero_fiche: data.Numero_Fiche },
        update: {
          $set: {
            updated_at: importMeta.import_date,
          },
        },
      },
    });
  }

  operations.push({
    updateOne: {
      filter: {
        $or: [
          {
            numero_fiche: data.Numero_Fiche,
            date_derniere_publication: { $lt: importMeta.archiveMeta.date_publication },
          },
          { numero_fiche: data.Numero_Fiche, date_derniere_publication: null },
        ],
      },
      update: {
        $set: {
          date_derniere_publication: importMeta.archiveMeta.date_publication,
          data: initialData,
          updated_at: importMeta.import_date,
        },
      },
    },
  });

  operations.push({
    updateOne: {
      filter: {
        $or: [
          {
            numero_fiche: data.Numero_Fiche,
            date_premiere_publication: { $gt: importMeta.archiveMeta.date_publication },
          },
          { numero_fiche: data.Numero_Fiche, date_premiere_publication: null },
        ],
      },
      update: {
        $set: {
          date_premiere_publication: importMeta.archiveMeta.date_publication,
          updated_at: importMeta.import_date,
        },
      },
    },
  });

  if (fichierMeta.source === "standard") {
    operations.push({
      updateOne: {
        filter: { numero_fiche: data.Numero_Fiche, date_derniere_publication: importMeta.archiveMeta.date_publication },
        update: {
          $set: {
            updated_at: importMeta.import_date,
            [`data.${fichierMeta.source}`]: data,
            active: (data as ISourceFcStandard).Actif === "ACTIVE",
          },
        },
      },
    });

    if ((data as ISourceFcStandard).Actif === "ACTIVE") {
      operations.push({
        updateOne: {
          filter: { numero_fiche: data.Numero_Fiche, date_premiere_activation: null },
          update: {
            $set: {
              date_premiere_activation: importMeta.archiveMeta.date_publication,
              date_derniere_activation: importMeta.archiveMeta.date_publication,
              updated_at: importMeta.import_date,
            },
          },
        },
      });
      operations.push({
        updateOne: {
          filter: {
            numero_fiche: data.Numero_Fiche,
            date_premiere_activation: { $gt: importMeta.archiveMeta.date_publication },
          },
          update: {
            $set: {
              date_premiere_activation: importMeta.archiveMeta.date_publication,
              updated_at: importMeta.import_date,
            },
          },
        },
      });
      operations.push({
        updateOne: {
          filter: {
            numero_fiche: data.Numero_Fiche,
            date_derniere_activation: { $lt: importMeta.archiveMeta.date_publication },
          },
          update: {
            $set: {
              date_derniere_activation: importMeta.archiveMeta.date_publication,
              updated_at: importMeta.import_date,
            },
          },
        },
      });
    }
  } else {
    operations.push({
      updateOne: {
        filter: { numero_fiche: data.Numero_Fiche, date_derniere_publication: importMeta.archiveMeta.date_publication },
        update: {
          $addToSet: {
            [`data.${fichierMeta.source}`]: data,
          },
          $set: {
            updated_at: importMeta.import_date,
          },
        },
      },
    });
  }

  return operations;
}

export async function importRncpFile(entry: Entry, importMeta: IImportMetaFranceCompetence, signal?: AbortSignal) {
  try {
    const fichierMeta = getFichierMetaFromFilename(entry);

    await pipeline(
      entry,
      parse({
        bom: true,
        columns: true,
        relax_column_count: true,
        encoding: "utf8",
        delimiter: ";",
        trim: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRecord: (record, { columns }: any) => {
          const data = columns.reduce((acc: Record<string, string | null>, column: { name: string }) => {
            acc[column.name] = record[column.name]?.trim() || null;
            return acc;
          }, {});

          return processRecord(importMeta, fichierMeta, data, columns);
        },
      }),
      createChangeBatchCardinalityTransformStream({ size: 500 }),
      new Transform({
        objectMode: true,
        async transform(chunk: AnyBulkWriteOperation<ISourceFranceCompetence>[], _encoding, callback) {
          try {
            // Operations need to be ordered
            await getDbCollection("source.france_competence").bulkWrite(chunk, { ordered: true });
            callback();
          } catch (error) {
            callback(withCause(internal("import.france_competence: error when inserting"), error));
          }
        },
      }),
      { signal }
    );
  } catch (error) {
    if (signal && error.name === signal?.reason?.name) {
      throw signal.reason;
    }
    throw withCause(internal("import.france_competence: unable to importRncpFile"), error);
  }
}

function getAnciennesFiches(doc: ISourceFranceCompetence): string[] {
  const result: Set<string> = new Set();

  for (const { Ancienne_Certification } of doc.data.ancienne_nouvelle_certification) {
    if (Ancienne_Certification) result.add(Ancienne_Certification);
  }

  return Array.from(result);
}

function getNouvellesFiches(doc: ISourceFranceCompetence): string[] {
  const result: Set<string> = new Set();

  for (const { Nouvelle_Certification } of doc.data.ancienne_nouvelle_certification) {
    if (Nouvelle_Certification) result.add(Nouvelle_Certification);
  }

  return Array.from(result);
}

async function buildContinuityMap(
  importMeta: IImportMetaFranceCompetence
): Promise<Map<string, Map<string, { fromAncien: boolean; fromNouveau: boolean }>>> {
  const cursor = getDbCollection("source.france_competence").find<ISourceFranceCompetence>({
    // Prevent concurrency issues, make sure we are not updating a document that has been updated since the import
    updated_at: { $lte: importMeta.import_date },
    "data.ancienne_nouvelle_certification.0": { $exists: true },
  });

  const continuity = new Map<string, Map<string, { fromAncien: boolean; fromNouveau: boolean }>>();

  for await (const doc of cursor) {
    const anciennesFiches = getAnciennesFiches(doc);
    const nouvellesFiches = getNouvellesFiches(doc);

    for (const ancienneFiche of anciennesFiches) {
      const nouvelleFiche = doc.numero_fiche;
      if (!continuity.has(ancienneFiche)) {
        continuity.set(ancienneFiche, new Map());
      }
      if (!continuity.get(ancienneFiche)?.has(nouvelleFiche)) {
        continuity.get(ancienneFiche)!.set(nouvelleFiche, { fromAncien: false, fromNouveau: false });
      }
      continuity.get(ancienneFiche)!.get(nouvelleFiche)!.fromNouveau = true;
    }

    for (const nouvelleFiche of nouvellesFiches) {
      const ancienneFiche = doc.numero_fiche;
      if (!continuity.has(ancienneFiche)) {
        continuity.set(ancienneFiche, new Map());
      }
      if (!continuity.get(ancienneFiche)?.has(nouvelleFiche)) {
        continuity.get(ancienneFiche)!.set(nouvelleFiche, { fromAncien: false, fromNouveau: false });
      }
      continuity.get(ancienneFiche)!.get(nouvelleFiche)!.fromAncien = true;
    }
  }

  return continuity;
}

async function fixContinuity(importMeta: IImportMetaFranceCompetence): Promise<{ anciens: number; nouveaux: number }> {
  const continuity = await buildContinuityMap(importMeta);

  const corrections = { anciens: 0, nouveaux: 0 };
  for (const [ancienneFiche, map] of continuity) {
    for (const [nouvelleFiche, { fromAncien, fromNouveau }] of map) {
      if (!fromAncien) {
        corrections.anciens++;
        await getDbCollection("source.france_competence").updateOne(
          {
            // Prevent concurrency issues, make sure we are not updating a document that has been updated since the import
            updated_at: { $lte: importMeta.import_date },
            numero_fiche: nouvelleFiche,
          },
          {
            $push: {
              "data.ancienne_nouvelle_certification": {
                Numero_Fiche: nouvelleFiche,
                Ancienne_Certification: ancienneFiche,
                Nouvelle_Certification: null,
              },
            },
          }
        );
      }

      if (!fromNouveau) {
        corrections.nouveaux++;
        await getDbCollection("source.france_competence").updateOne(
          {
            // Prevent concurrency issues, make sure we are not updating a document that has been updated since the import
            updated_at: { $lte: importMeta.import_date },
            numero_fiche: ancienneFiche,
          },
          {
            $push: {
              "data.ancienne_nouvelle_certification": {
                Numero_Fiche: ancienneFiche,
                Ancienne_Certification: null,
                Nouvelle_Certification: nouvelleFiche,
              },
            },
          }
        );
      }
    }
  }

  return corrections;
}

export async function importRncpArchive(importMeta: IImportMetaFranceCompetence, signal?: AbortSignal) {
  try {
    const readStream = await downloadDataGouvResource(importMeta.archiveMeta.resource);

    if (signal) addAbortSignal(signal, readStream);

    const zip = readStream.pipe(unzipper.Parse({ forceStream: true }));
    for await (const entry of zip) {
      await importRncpFile(entry, importMeta, signal);
      entry.autodrain();
    }

    const corrections = { continuity: await fixContinuity(importMeta) };

    const [total, active, created, updated, activated] = await Promise.all([
      getDbCollection("source.france_competence").countDocuments(),
      getDbCollection("source.france_competence").countDocuments({ active: true }),
      getDbCollection("source.france_competence").countDocuments({ created_at: importMeta.import_date }),
      getDbCollection("source.france_competence").countDocuments({ updated_at: importMeta.import_date }),
      getDbCollection("source.france_competence").countDocuments({
        date_premiere_activation: importMeta.archiveMeta.date_publication,
      }),
    ]);

    return {
      total,
      active,
      created,
      updated,
      activated,
      corrections,
    };
  } catch (error) {
    if (signal && error.name === signal?.reason?.name) {
      throw signal.reason;
    }
    throw withCause(internal("import.france_competence: unable to importRncpArchive", { importMeta }), error);
  }
}

export async function onImportRncpArchiveFailure(importMeta: IImportMetaFranceCompetence) {
  try {
    await getDbCollection("import.meta").deleteOne({ _id: importMeta._id });
  } catch (error) {
    throw withCause(internal("import.france_competence: unable to onImportRncpArchiveFailure"), error);
  }
}

async function getUnprocessedImportMeta(dataset: IDataGouvDataset): Promise<IImportMetaFranceCompetence[]> {
  try {
    const successfullyImported = await getDbCollection("import.meta")
      .find<IImportMetaFranceCompetence>({ type: "france_competence" }, { sort: { import_date: -1 } })
      .toArray();

    const successfullyImportedByResourceId = successfullyImported.reduce<Map<string, IImportMetaFranceCompetence>>(
      (acc, meta) => {
        acc.set(meta.archiveMeta.resource.id, meta);
        return acc;
      },
      new Map()
    );

    return dataset.resources.reduce<IImportMetaFranceCompetence[]>((acc, resource) => {
      const archiveMeta = getArchiveMeta(resource);

      if (!archiveMeta) {
        return acc;
      }

      const lastSuccessfullyImportedTime =
        successfullyImportedByResourceId.get(resource.id)?.archiveMeta.last_updated.getTime() ?? 0;

      if (archiveMeta.last_updated.getTime() > lastSuccessfullyImportedTime) {
        acc.push({
          _id: new ObjectId(),
          import_date: new Date(),
          type: "france_competence",
          archiveMeta,
        });
      }

      return acc;
    }, []);
  } catch (error) {
    throw withCause(internal("import.france_competence: unable to getUnprocessedRncpResources"), error);
  }
}

export async function runRncpImporter() {
  try {
    const dataset = await fetchDataGouvDataSet("5eebbc067a14b6fecc9c9976");

    const importMetas = await getUnprocessedImportMeta(dataset);

    for (const importMeta of importMetas) {
      await addJob({ name: "import:france_competence:resource", payload: importMeta, queued: true });
      await getDbCollection("import.meta").insertOne(importMeta);
    }

    return {
      count: importMetas.length,
      archives: importMetas.map((meta) => meta.archiveMeta.nom),
    };
  } catch (error) {
    throw withCause(internal("import.france_competence: unable to runRncpImporter"), error);
  }
}
