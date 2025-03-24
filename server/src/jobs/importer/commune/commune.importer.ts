import { internal } from "@hapi/boom";
import type { ICommune } from "api-alternance-sdk";
import type { AnyBulkWriteOperation } from "mongodb";
import { ObjectId } from "mongodb";
import type { ImportStatus, ISourceGeoCommune, ISourceGeoRegion } from "shared";
import type { ICommuneInternal } from "shared/models/commune.model";

import { fetchAcademies } from "@/services/apis/enseignementSup/enseignementSup.js";
import { fetchGeoCommunes, fetchGeoDepartements, fetchGeoRegion, fetchGeoRegions } from "@/services/apis/geo/geo.js";
import {
  fetchAnciennesCommuneByCodeCommune,
  fetchArrondissementIndexedByCodeCommune,
  fetchCollectivitesOutreMer,
} from "@/services/apis/insee/insee.js";
import { withCause } from "@/services/errors/withCause.js";
import parentLogger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

const logger = parentLogger.child({ module: "import:communes" });

async function findCommuneMissionLocale(
  commune: ISourceGeoCommune,
  anciennes: ICommune["anciennes"],
  arrondissements: ICommune["arrondissements"]
): Promise<ICommune["mission_locale"]> {
  const result = await getDbCollection("source.insee_to_ml").findOne({
    code_insee: {
      $in: [commune.code, ...anciennes.map((a) => a.codeInsee), ...arrondissements.map((a) => a.code)],
    },
  });

  if (result !== null) {
    return result.ml;
  }

  return null;
}

export async function runCommuneImporter() {
  logger.info("Importing communes ...");

  const importDate = new Date();
  const importId = new ObjectId();

  try {
    await getDbCollection("import.meta").insertOne({
      _id: importId,
      import_date: importDate,
      type: "communes",
      status: "pending",
    });

    const [regions, collectivites, academies, arrondissementsInsee, anciennesMap] = await Promise.all([
      fetchGeoRegions(),
      fetchCollectivitesOutreMer().then(async (collectivites) =>
        // On exclus les "Île des Faisans"
        Promise.all(collectivites.filter((c) => c.code !== "981").map((c) => fetchGeoRegion(c.code)))
      ),
      fetchAcademies(),
      fetchArrondissementIndexedByCodeCommune(),
      fetchAnciennesCommuneByCodeCommune(),
    ]);

    const academieByDep = new Map<string, ICommune["academie"]>();
    for (const academie of academies) {
      academieByDep.set(academie.dep_code, {
        nom: academie.aca_nom,
        id: academie.aca_id,
        code: academie.aca_code,
      });
    }

    const extendedRegions: ISourceGeoRegion[] = [...regions, ...collectivites];

    for (const region of extendedRegions) {
      logger.info(`Importing departements for region ${region.nom}(${region.code}) ...`);
      const departements = await fetchGeoDepartements(region.code);
      for (const departement of departements) {
        logger.info(`Importing communes for departement ${departement.nom} ...`);
        const geoCommunes = await fetchGeoCommunes(departement.code);
        const academie = academieByDep.get(departement.code);
        if (!academie) {
          throw internal("import.communes: unable to find academy for departement", { departement });
        }

        const communes: ICommune[] = [];
        for (const geoCommune of geoCommunes) {
          const arrondissements =
            arrondissementsInsee[geoCommune.code]?.map(({ code, intitule }) => {
              return {
                code,
                nom: intitule,
              };
            }) ?? [];
          const anciennes: ICommune["anciennes"] =
            anciennesMap[geoCommune.code]?.map(({ code, intitule }) => ({ codeInsee: code, nom: intitule })) ?? [];
          const mission_locale = await findCommuneMissionLocale(geoCommune, anciennes, arrondissements);

          communes.push({
            nom: geoCommune.nom,
            code: { insee: geoCommune.code, postaux: geoCommune.codesPostaux },
            departement: {
              nom: departement.nom,
              codeInsee: departement.code,
            },
            anciennes,
            arrondissements,
            region: {
              codeInsee: region.code,
              nom: region.nom,
            },
            academie,
            localisation: {
              centre: geoCommune.centre,
              bbox: geoCommune.bbox,
            },
            mission_locale,
          });
        }

        const bulkUpdate: AnyBulkWriteOperation<ICommuneInternal>[] = communes.map((commune) => {
          const {
            code: { insee, postaux },
            ...rest
          } = commune;
          return {
            updateOne: {
              filter: { "code.insee": insee },
              update: {
                $set: {
                  ...rest,
                  "code.postaux": postaux,
                  updated_at: importDate,
                },
                $setOnInsert: {
                  _id: new ObjectId(),
                  created_at: importDate,
                },
              },
              upsert: true,
            },
          };
        });

        await getDbCollection("commune").bulkWrite(bulkUpdate);
      }
    }

    await getDbCollection("commune").deleteMany({
      updated_at: { $ne: importDate },
    });

    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });

    return { status: "done" };
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    throw withCause(internal("import.communes: unable to runCommuneImporter"), error, "fatal");
  }
}

export async function getCommuneImporterStatus(): Promise<ImportStatus> {
  const [lastImport, lastSuccess] = await Promise.all([
    await getDbCollection("import.meta").findOne({ type: "communes" }, { sort: { import_date: -1 } }),
    await getDbCollection("import.meta").findOne({ type: "communes", status: "done" }, { sort: { import_date: -1 } }),
  ]);

  return {
    last_import: lastImport?.import_date ?? null,
    last_success: lastSuccess?.import_date ?? null,
    status: lastImport?.status ?? "pending",
    resources: [],
  };
}
