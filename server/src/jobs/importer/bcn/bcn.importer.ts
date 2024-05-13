import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { ObjectId } from "mongodb";
import { IBcn_N_FormationDiplome, ISourceBcn, zBcnBySource } from "shared/models/source/bcn/source.bcn.model";
import { ZodError } from "zod";

import { fetchBcnData } from "@/services/apis/bcn/bcn";
import { withCause } from "@/services/errors/withCause";
import parentLogger from "@/services/logger";
import { getDbCollection } from "@/services/mongodb/mongodbService";
import { createBatchTransformStream } from "@/utils/streamUtils";

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
    const zod = zBcnBySource[source as keyof typeof zBcnBySource] ?? null;

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

    await getDbCollection("source.bcn").deleteMany({
      source,
      date: { $ne: date },
    });

    return await getDbCollection("source.bcn").countDocuments({ date, source });
  } catch (error) {
    await getDbCollection("source.bcn").deleteMany({ date });
    throw withCause(internal("import.bcn: unable to importBcnSource", { source }), error);
  }
}

export async function fixDiplomeContinuity(importDate: Date): Promise<{ anciens: number; nouveaux: number }> {
  const cursor = getDbCollection("source.bcn").find<IBcn_N_FormationDiplome>({
    source: "N_FORMATION_DIPLOME",
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

  const corrections = { anciens: 0, nouveaux: 0 };
  for (const [ancienDiplome, map] of continuity) {
    for (const [nouveauDiplome, { fromAncien, fromNouveau }] of map) {
      if (!fromAncien) {
        corrections.anciens++;
        await getDbCollection("source.bcn").updateOne(
          {
            source: "N_FORMATION_DIPLOME",
            date: importDate,
            data: {
              FORMATION_DIPLOME: nouveauDiplome,
            },
          },
          {
            $set: {
              ANCIEN_DIPLOMES: { $push: ancienDiplome },
            },
          }
        );
      }
      if (!fromNouveau) {
        corrections.nouveaux++;
        await getDbCollection("source.bcn").updateOne(
          {
            source: "N_FORMATION_DIPLOME",
            date: importDate,
            data: {
              FORMATION_DIPLOME: ancienDiplome,
            },
          },
          {
            $set: {
              NOUVEAU_DIPLOMES: { $push: nouveauDiplome },
            },
          }
        );
      }
    }
  }

  return corrections;
}

export async function runBcnImporter(): Promise<Record<string, unknown>> {
  const importDate = new Date();

  try {
    const statsBySource: Record<string, unknown> = {};

    statsBySource["N_FORMATION_DIPLOME"] = await importBcnSource("N_FORMATION_DIPLOME", importDate);
    statsBySource["N_FORMATION_DIPLOME_ENQUETE_51"] = await importBcnSource(
      "N_FORMATION_DIPLOME_ENQUETE_51",
      importDate
    );
    statsBySource["N_NIVEAU_FORMATION_DIPLOME"] = await importBcnSource("N_NIVEAU_FORMATION_DIPLOME", importDate);
    statsBySource["V_FORMATION_DIPLOME"] = await importBcnSource("V_FORMATION_DIPLOME", importDate);

    statsBySource["CORRECTION_CONTINUITE"] = await fixDiplomeContinuity(importDate);

    await getDbCollection("import.meta").insertOne({
      _id: new ObjectId(),
      import_date: importDate,
      type: "bcn",
    });

    return statsBySource;
  } catch (error) {
    throw withCause(internal("import.bcn: unable to runBcnImporter"), error);
  }
}
