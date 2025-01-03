import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { addJob } from "job-processor";
import { ObjectId } from "mongodb";
import type { IBcn_N_FormationDiplome, ISourceBcn } from "shared/models/source/bcn/source.bcn.model";
import { zBcnBySource } from "shared/models/source/bcn/source.bcn.model";
import { ZodError } from "zod";

import { fetchBcnData } from "@/services/apis/bcn/bcn.js";
import { withCause } from "@/services/errors/withCause.js";
import parentLogger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

const logger = parentLogger.child({ module: "import:bcn" });

function getNouveauDiplomes(data: Record<string, string | null>): string[] {
  const result = new Set<string>();
  for (const key of Object.keys(data)) {
    if (key.startsWith("NOUVEAU_DIPLOME_")) {
      const value = data[key];
      if (value) result.add(value);
    }
  }
  return Array.from(result);
}

function getAncienDiplomes(data: Record<string, string | null>): string[] {
  const result = new Set<string>();
  for (const key of Object.keys(data)) {
    if (key.startsWith("ANCIEN_DIPLOME_")) {
      const value = data[key];
      if (value) result.add(value);
    }
  }
  return Array.from(result);
}

async function importBcnSource(source: ISourceBcn["source"], date: Date): Promise<number> {
  logger.info({ source }, "fetching BCN data");

  try {
    const zod = zBcnBySource[source] ?? null;

    if (zod === null) {
      throw internal("import.bcn: unexpected source", { source });
    }

    const stream = await fetchBcnData(source);

    logger.info({ source }, "parsing BCN data");

    await pipeline(
      stream,
      parse({
        bom: true,
        columns: true,
        relax_column_count: true,
        encoding: "latin1",
        delimiter: ";",
        trim: true,
        quote: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRecord: (record, { columns }: any) => {
          const data = columns.reduce((acc: Record<string, string | null>, column: { name: string }) => {
            if (column.name.startsWith("ANCIEN_DIPLOME_") || column.name.startsWith("NOUVEAU_DIPLOME_")) {
              return acc;
            }

            // Replace all mongodb dot special character with underscore
            acc[column.name.replaceAll(".", "_")] = record[column.name]?.trim() || null;
            return acc;
          }, {});

          if (source === "N_FORMATION_DIPLOME") {
            data["ANCIEN_DIPLOMES"] = getAncienDiplomes(record);
            data["NOUVEAU_DIPLOMES"] = getNouveauDiplomes(record);
          }

          try {
            return zod.parse({
              _id: new ObjectId(),
              source,
              date,
              data,
            });
          } catch (error) {
            if (error instanceof ZodError) {
              throw internal("import.bcn: error when parsing", {
                source,
                error: error.format(),
                record,
                data,
                columns,
              });
            }

            throw error;
          }
        },
      }),
      createBatchTransformStream({ size: 100 }),
      new Transform({
        objectMode: true,
        async transform(chunk, _encoding, callback) {
          try {
            await getDbCollection("source.bcn").insertMany(chunk);
            callback();
          } catch (error) {
            callback(withCause(internal("import.bcn: error when inserting"), error));
          }
        },
      })
    );

    const count = await getDbCollection("source.bcn").countDocuments({ date, source });

    if (count === 0) {
      throw internal("import.bcn: no data imported", { source });
    }

    await getDbCollection("source.bcn").deleteMany({
      source,
      date: { $ne: date },
    });

    return count;
  } catch (error) {
    await getDbCollection("source.bcn").deleteMany({ date });
    throw withCause(internal("import.bcn: unable to importBcnSource", { source }), error);
  }
}

export async function indicateurDiplomeContinuity(importDate: Date): Promise<{ anciens: number; nouveaux: number }> {
  const cursor = getDbCollection("source.bcn").find<IBcn_N_FormationDiplome>({
    source: "N_FORMATION_DIPLOME",
    date: importDate,
  });

  const continuity = new Map<string, Map<string, { fromAncien: boolean; fromNouveau: boolean }>>();
  for await (const doc of cursor) {
    for (const ancienDiplome of doc.data.ANCIEN_DIPLOMES) {
      const nouveauDiplome = doc.data.FORMATION_DIPLOME;
      if (!continuity.has(ancienDiplome)) {
        continuity.set(ancienDiplome, new Map());
      }
      if (!continuity.get(ancienDiplome)?.has(nouveauDiplome)) {
        continuity.get(ancienDiplome)!.set(nouveauDiplome, { fromAncien: false, fromNouveau: false });
      }
      continuity.get(ancienDiplome)!.get(nouveauDiplome)!.fromNouveau = true;
    }

    for (const nouveauDiplome of doc.data.NOUVEAU_DIPLOMES) {
      const ancienDiplome = doc.data.FORMATION_DIPLOME;
      if (!continuity.has(ancienDiplome)) {
        continuity.set(ancienDiplome, new Map());
      }
      if (!continuity.get(ancienDiplome)?.has(nouveauDiplome)) {
        continuity.get(ancienDiplome)!.set(nouveauDiplome, { fromAncien: false, fromNouveau: false });
      }
      continuity.get(ancienDiplome)!.get(nouveauDiplome)!.fromAncien = true;
    }
  }

  const indicateur = { anciens: 0, nouveaux: 0 };
  for (const [, map] of continuity) {
    for (const [, { fromAncien, fromNouveau }] of map) {
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

export async function runBcnImporter(): Promise<Record<string, unknown>> {
  const importDate = new Date();

  const importId = new ObjectId();

  try {
    await getDbCollection("import.meta").insertOne({
      _id: importId,
      import_date: importDate,
      type: "bcn",
      status: "pending",
    });

    const statsBySource: Record<string, unknown> = {};

    statsBySource["N_FORMATION_DIPLOME"] = await importBcnSource("N_FORMATION_DIPLOME", importDate);
    statsBySource["N_FORMATION_DIPLOME_ENQUETE_51"] = await importBcnSource(
      "N_FORMATION_DIPLOME_ENQUETE_51",
      importDate
    );
    statsBySource["N_NIVEAU_FORMATION_DIPLOME"] = await importBcnSource("N_NIVEAU_FORMATION_DIPLOME", importDate);
    statsBySource["V_FORMATION_DIPLOME"] = await importBcnSource("V_FORMATION_DIPLOME", importDate);

    statsBySource["INDICATEUR_CONTINUITE"] = await indicateurDiplomeContinuity(importDate);

    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });

    await addJob({ name: "indicateurs:source_kit_apprentissage:update" });

    return statsBySource;
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    throw withCause(internal("import.bcn: unable to runBcnImporter"), error, "fatal");
  }
}
