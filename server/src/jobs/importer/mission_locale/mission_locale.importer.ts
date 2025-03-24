import { internal } from "@hapi/boom";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import type { AnyBulkWriteOperation } from "mongodb";
import { ObjectId } from "mongodb";
import type { ImportStatus } from "shared";
import type { ISourceCodeInseeToMissionLocale } from "shared/models/source/mission_locale/source.mission_locale.model";
import { pipeline } from "stream/promises";
import { z } from "zod";

import { fetchDepartementMissionLocale } from "@/services/apis/unml/unml.js";
import { withCause } from "@/services/errors/withCause.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { getStaticFilePath } from "@/utils/getStaticFilePath.js";
import { createBatchTransformStream } from "@/utils/streamUtils.js";

const zRecord = z.object({
  "Code INSEE": z.string().regex(/\d{1}(\d|[A-B])\d{3}/),
  "Nom Commune": z.string(),
  "Code ML": z.string().regex(/\d{1}(\d|[A-B])\d{3}/),
  "Nom Officiel ML": z.string(),
  "Commune présente sur plusieurs ML": z.literal("Non"),
  "Adresse ML": z.string(),
  "Code Postal ML": z.string().regex(/\d{5}/),
  "Ville ML": z.string(),
});

async function fetchDepartementStructures(
  codeDepartement: string,
  store: Map<string, ISourceCodeInseeToMissionLocale["ml"]>
) {
  const { results } = await fetchDepartementMissionLocale(codeDepartement);

  for (const { structure } of results) {
    if (!store.has(structure.codeStructure)) {
      store.set(structure.codeStructure, {
        id: structure.id,
        code: structure.codeStructure,
        nom: structure.nomStructure,
        siret: structure.siret,
        localisation: {
          geopoint:
            structure.geoloc_lng == null || structure.geoloc_lat == null
              ? null
              : {
                  type: "Point",
                  coordinates: [parseFloat(structure.geoloc_lng), parseFloat(structure.geoloc_lat)],
                },
          adresse: [structure.adresse1, structure.adresse2].join(" ").replaceAll("  ", " "),
          cp: structure.cp,
          ville: structure.ville,
        },
        contact: {
          email: structure.emailAccueil,
          telephone: structure.telephones,
          siteWeb: structure.siteWeb,
        },
      });
    }
  }
}

export async function runMissionLocaleImporter() {
  const importDate = new Date();
  const importId = new ObjectId();

  try {
    await getDbCollection("import.meta").insertOne({
      _id: importId,
      import_date: importDate,
      type: "mission_locale",
      status: "pending",
    });

    const notFoundUnml: Map<string, { code_ml: string; cp: string }> = new Map();

    await pipeline(
      createReadStream(getStaticFilePath("mission_locales/zones_de_couverture_janvier_2025.csv")),
      parse({
        bom: true,
        columns: true,
        encoding: "utf8",
        delimiter: ";",
        trim: true,
      }),
      async function* processRecord(
        source: AsyncIterable<Record<string, string>>,
        { signal }: { signal?: AbortSignal } = {}
      ): AsyncIterable<AnyBulkWriteOperation<ISourceCodeInseeToMissionLocale>> {
        const codeStructuctureToML = new Map<string, ISourceCodeInseeToMissionLocale["ml"]>();

        for await (const record of source) {
          signal?.throwIfAborted();

          const data = await zRecord.parseAsync(record).catch((e) => {
            throw withCause(internal("Unable to parse record", { record }), e);
          });

          const code_ml = data["Code ML"];
          if (!codeStructuctureToML.has(code_ml) && !notFoundUnml.has(code_ml)) {
            await fetchDepartementStructures(data["Code Postal ML"].slice(0, 2), codeStructuctureToML);
            if (!codeStructuctureToML.has(code_ml)) {
              notFoundUnml.set(code_ml, { code_ml: code_ml, cp: data["Code Postal ML"] });
            }
          }

          yield {
            updateOne: {
              filter: {
                code_insee: data["Code INSEE"],
              },
              update: {
                $set: {
                  ml: codeStructuctureToML.get(data["Code ML"]) ?? null,
                  import_id: importId,
                },
                $setOnInsert: {
                  _id: new ObjectId(),
                },
              },
              upsert: true,
            },
          };
        }
      },
      createBatchTransformStream({ size: 500 }),
      async function* write(
        source: AsyncIterable<AnyBulkWriteOperation<ISourceCodeInseeToMissionLocale>[]>,
        { signal }: { signal?: AbortSignal } = {}
      ) {
        for await (const bulk of source) {
          signal?.throwIfAborted();
          await getDbCollection("source.insee_to_ml").bulkWrite(bulk, { ordered: false });
          yield;
        }

        await getDbCollection("source.insee_to_ml").deleteMany({
          import_id: { $ne: importId },
        });

        await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });
        yield;
      }
    );
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    throw withCause(internal("import.mission_locale: unable to runMissionLocaleImporter"), error, "fatal");
  }
}

export async function getMissionLocaleImporterStatus(): Promise<ImportStatus> {
  const [lastImport, lastSuccess] = await Promise.all([
    await getDbCollection("import.meta").findOne({ type: "mission_locale" }, { sort: { import_date: -1 } }),
    await getDbCollection("import.meta").findOne(
      { type: "mission_locale", status: "done" },
      { sort: { import_date: -1 } }
    ),
  ]);

  return {
    last_import: lastImport?.import_date ?? null,
    last_success: lastSuccess?.import_date ?? null,
    status: lastImport?.status ?? "pending",
    resources: [],
  };
}
