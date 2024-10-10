import { internal } from "@hapi/boom";
import type { ICommune } from "api-alternance-sdk";
import type { AnyBulkWriteOperation } from "mongodb";
import { ObjectId } from "mongodb";
import type { ICommuneInternal } from "shared/models/commune.model";

import { fetchAcademies } from "@/services/apis/enseignementSup/enseignementSup.js";
import type { ISourceGeoRegion } from "@/services/apis/geo/geo.js";
import { fetchGeoCommunes, fetchGeoDepartements, fetchGeoRegions } from "@/services/apis/geo/geo.js";
import { fetchCollectivitesOutreMer } from "@/services/apis/insee/insee.js";
import { withCause } from "@/services/errors/withCause.js";
import parentLogger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

const logger = parentLogger.child({ module: "import:communes" });

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

    const [regions, collectivites, academies] = await Promise.all([
      fetchGeoRegions(),
      fetchCollectivitesOutreMer(),
      fetchAcademies(),
    ]);

    const academieByDep = new Map<string, ICommune["departement"]["academie"]>();
    for (const academie of academies) {
      academieByDep.set(academie.dep_code, {
        nom: academie.aca_nom,
        id: academie.aca_id,
        code: academie.aca_code,
      });
    }

    const extendedRegions: ISourceGeoRegion[] = [
      ...regions,
      ...collectivites.map((collectivite) => ({
        nom: collectivite.intitule,
        code: collectivite.code,
      })),
    ];

    for (const region of extendedRegions) {
      logger.info(`Importing departements for region ${region.nom}(${region.code}) ...`);
      const departements = await fetchGeoDepartements(region.code);
      for (const departement of departements) {
        logger.info(`Importing communes for departement ${departement.nom} ...`);
        const geoCommunes = await fetchGeoCommunes(departement.code);

        const academie = academieByDep.get(departement.code);
        if (!academie) {
          throw internal("import.comunnes: unable to find academy for departement", { departement });
        }

        const communes: ICommune[] = geoCommunes.map((geoCommune) => ({
          nom: geoCommune.nom,
          codeInsee: geoCommune.code,
          codesPostaux: geoCommune.codesPostaux,
          departement: {
            nom: departement.nom,
            codeInsee: departement.code,
            region: {
              codeInsee: region.code,
              nom: region.nom,
            },
            academie,
          },
          centre: geoCommune.centre,
          bbox: geoCommune.bbox,
        }));

        const bulkUpdate: AnyBulkWriteOperation<ICommuneInternal>[] = communes.map((commune) => {
          const { codeInsee, ...rest } = commune;
          return {
            updateOne: {
              filter: { codeInsee },
              update: {
                $set: {
                  ...rest,
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
    throw withCause(internal("import.comunnes: unable to runCommuneImporter"), error, "fatal");
  }
}
