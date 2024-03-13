import { Transform } from "node:stream";

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
import { pipeline } from "stream/promises";
import unzipper, { Entry } from "unzipper";

import { downloadDataGouvResource, fetchDataGouvDataSet } from "@/common/apis/data_gouv/data_gouv.api";
import { withCause } from "@/common/errors/withCause";
import { getDbCollection } from "@/common/utils/mongodbUtils";
import { createChangeBatchCardinalityTransformStream } from "@/common/utils/streamUtils";

type FichierMeta = {
  source: keyof ISourceFranceCompetence["data"];
};

function getFichierMetaFromFilename(entry: Entry): FichierMeta {
  if (/^export_fiches_CSV_Blocs_De_Compétences_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "blocs_de_competences" };
  }
  if (/^export_fiches_CSV_CCN_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "ccn" };
  }
  if (/^export_fiches_CSV_Partenaires_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "partenaires" };
  }
  if (/^export_fiches_CSV_Nsf_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "nsf" };
  }
  if (/^export_fiches_CSV_Formacode_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "formacode" };
  }
  if (/^export_fiches_CSV_Ancienne_Nouvelle_Certification_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "ancienne_nouvelle_certification" };
  }
  if (/^export_fiches_CSV_VoixdAccès_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "voies_d_acces" };
  }
  if (/^export_fiches_CSV_Rome_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "rome" };
  }
  if (/^export_fiches_CSV_Certificateurs_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "certificateurs" };
  }
  if (/^export_fiches_CSV_Standard_\d{4}_\d{2}_\d{2}\.csv/.test(entry.path)) {
    return { source: "standard" };
  }

  throw internal("import.france_competence: unexpected filename", { filename: entry.path });
}

function getArchiveMeta(resource: IDataGouvDatasetResource): IArchiveMeta | null {
  const match = resource.title.match(/^export-fiches-csv-(\d{4})-(\d{2})-(\d{2})\.zip/);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  return {
    date_publication: new Date(`${year}-${month}-${day}T00:00:00.000Z`),
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
    files: {},
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
            [`files.${importMeta.archiveMeta.resource.id}`]: {
              nom: importMeta.archiveMeta.nom,
              last_updated: importMeta.archiveMeta.last_updated,
              date_publication: importMeta.archiveMeta.date_publication,
            },
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

export async function importRncpFile(entry: Entry, importMeta: IImportMetaFranceCompetence) {
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
      })
    );
  } catch (error) {
    throw withCause(internal("import.france_competence: unable to importRncpFile"), error);
  }
}

export async function importRncpArchive(importMeta: IImportMetaFranceCompetence) {
  try {
    const readStream = await downloadDataGouvResource(importMeta.archiveMeta.resource);
    const zip = readStream.pipe(unzipper.Parse({ forceStream: true }));
    for await (const entry of zip) {
      await importRncpFile(entry, importMeta);
      entry.autodrain();
    }

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
    };
  } catch (error) {
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
