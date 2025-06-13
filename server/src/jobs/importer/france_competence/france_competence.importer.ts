import { addAbortSignal, Transform } from "node:stream";

import { pipeline } from "stream/promises";
import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { addJob } from "job-processor";
import type { AnyBulkWriteOperation } from "mongodb";
import { ObjectId } from "mongodb";
import type { IDataGouvDataset, IDataGouvDatasetResource, ImportStatus } from "shared";
import type { IArchiveMeta, IImportMetaFranceCompetence } from "shared/models/import.meta.model";
import type { ISourceFcStandard } from "shared/models/source/france_competence/parts/source.france_competence.standard.model";
import type {
  ISourceFranceCompetence,
  ISourceFranceCompetenceDataPart,
} from "shared/models/source/france_competence/source.france_competence.model";
import { zFranceCompetenceDataBySource } from "shared/models/source/france_competence/source.france_competence.model";
import { parisTimezoneDate } from "shared/zod/date.primitives";
import type { Entry } from "unzipper";
import { Parse } from "unzipper";

import { downloadDataGouvResource, fetchDataGouvDataSet } from "@/services/apis/data_gouv/data_gouv.api.js";
import { withCause } from "@/services/errors/withCause.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createChangeBatchCardinalityTransformStream } from "@/utils/streamUtils.js";

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

async function indicateurContinuity(
  importMeta: IImportMetaFranceCompetence
): Promise<{ anciens: number; nouveaux: number }> {
  const continuity = await buildContinuityMap(importMeta);

  const indicateur = { anciens: 0, nouveaux: 0 };
  for (const [_ancienneFiche, map] of continuity) {
    for (const [_nouvelleFiche, { fromAncien, fromNouveau }] of map) {
      if (!fromAncien) {
        indicateur.anciens++;
      }

      if (!fromNouveau) {
        indicateur.nouveaux++;
      }
    }
  }

  return indicateur;
}

export async function importRncpArchive(importMeta: IImportMetaFranceCompetence, signal?: AbortSignal) {
  try {
    await getDbCollection("import.meta").updateOne(
      { _id: importMeta._id },
      {
        $set: {
          import_date: new Date(),
        },
      }
    );

    const readStream = await downloadDataGouvResource(importMeta.archiveMeta.resource);

    if (signal) addAbortSignal(signal, readStream);

    const zip = readStream.pipe(Parse({ forceStream: true }));
    for await (const entry of zip) {
      await importRncpFile(entry, importMeta, signal);
      entry.autodrain();
    }

    const indicateurs = { continuity: await indicateurContinuity(importMeta) };

    const [total, active, created, updated, activated] = await Promise.all([
      getDbCollection("source.france_competence").countDocuments(),
      getDbCollection("source.france_competence").countDocuments({ active: true }),
      getDbCollection("source.france_competence").countDocuments({ created_at: importMeta.import_date }),
      getDbCollection("source.france_competence").countDocuments({ updated_at: importMeta.import_date }),
      getDbCollection("source.france_competence").countDocuments({
        date_premiere_activation: importMeta.archiveMeta.date_publication,
      }),
    ]);

    await getDbCollection("import.meta").updateOne(
      { _id: importMeta._id },
      {
        $set: {
          status: "done",
        },
      }
    );

    await addJob({ name: "indicateurs:source_kit_apprentissage:update" });

    return {
      total,
      active,
      created,
      updated,
      activated,
      indicateurs,
    };
  } catch (error) {
    if (signal && error.name === signal?.reason?.name) {
      throw signal.reason;
    }
    throw withCause(internal("import.france_competence: unable to importRncpArchive", { importMeta }), error, "fatal");
  }
}

export async function onImportRncpArchiveFailure(importMeta: IImportMetaFranceCompetence) {
  try {
    await getDbCollection("import.meta").updateOne({ _id: importMeta._id }, { $set: { status: "failed" } });
  } catch (error) {
    throw withCause(internal("import.france_competence: unable to onImportRncpArchiveFailure"), error, "fatal");
  }
}

async function getUnprocessedImportMeta(dataset: IDataGouvDataset): Promise<IImportMetaFranceCompetence[]> {
  try {
    const successfullyOrPendingImported = await getDbCollection("import.meta")
      .find<IImportMetaFranceCompetence>(
        { type: "france_competence", status: { $ne: "failed" } },
        { sort: { import_date: -1 } }
      )
      .toArray();

    const successfullyOrPendingByResourceId = successfullyOrPendingImported.reduce<
      Map<string, IImportMetaFranceCompetence>
    >((acc, meta) => {
      if (meta.status === "done") {
        acc.set(meta.archiveMeta.resource.id, meta);
      }

      const isImportDateWithin48Hours = meta.import_date.getTime() > new Date().getTime() - 48 * 3_600_000;

      // If the import is pending and less than 48h, we consider it as pending
      if (meta.status === "pending" && isImportDateWithin48Hours) {
        acc.set(meta.archiveMeta.resource.id, meta);
      }

      return acc;
    }, new Map());

    return dataset.resources.reduce<IImportMetaFranceCompetence[]>((acc, resource) => {
      const archiveMeta = getArchiveMeta(resource);

      if (!archiveMeta) {
        return acc;
      }

      const lastSuccessfullyOrPendingTime =
        successfullyOrPendingByResourceId.get(resource.id)?.archiveMeta.last_updated.getTime() ?? 0;

      if (archiveMeta.last_updated.getTime() > lastSuccessfullyOrPendingTime) {
        acc.push({
          _id: new ObjectId(),
          import_date: new Date(),
          type: "france_competence",
          archiveMeta,
          status: "pending",
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
    throw withCause(internal("import.france_competence: unable to runRncpImporter"), error, "fatal");
  }
}

export async function getFranceCompetencesImporterStatus(): Promise<ImportStatus> {
  const lastImportByResource = await getDbCollection("import.meta")
    .aggregate<{ last: IImportMetaFranceCompetence }>([
      {
        $match: { type: "france_competence" },
      },
      {
        $sort: { import_date: 1 },
      },
      {
        $group: { _id: "$archiveMeta.resource.id", last: { $last: "$$ROOT" } },
      },
      {
        $sort: {
          "last.import_date": -1,
        },
      },
    ])
    .toArray();

  const lastFileSuccessResource = lastImportByResource
    .filter((r) => r.last.status === "done")
    .toSorted((a, b) => b.last.archiveMeta.date_publication.getTime() - a.last.archiveMeta.date_publication.getTime())
    .at(0);

  const status = lastImportByResource.every((r) => r.last.status === "done")
    ? "done"
    : lastImportByResource.some((r) => r.last.status === "failed")
      ? "failed"
      : "pending";

  return {
    last_import: lastImportByResource[0].last?.import_date ?? null,
    last_success: lastFileSuccessResource?.last.archiveMeta.date_publication ?? null,
    status,
    resources: lastImportByResource
      .map((r) => ({
        name: r.last.archiveMeta.nom,
        status: r.last.status,
        import_date: r.last.import_date,
      }))
      .toSorted((a, b) => b.name.localeCompare(a.name)),
  };
}
