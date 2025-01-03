import { internal } from "@hapi/boom";
import type { ICommune } from "api-alternance-sdk";
import type { AnyBulkWriteOperation } from "mongodb";
import { ObjectId } from "mongodb";
import type { ISourceGeoCommune, ISourceGeoRegion, ISourceMissionLocale, ISourceUnmlPayload } from "shared";
import type { ICommuneInternal } from "shared/models/commune.model";

import { fetchAcademies } from "@/services/apis/enseignementSup/enseignementSup.js";
import { fetchGeoCommunes, fetchGeoDepartements, fetchGeoRegion, fetchGeoRegions } from "@/services/apis/geo/geo.js";
import {
  fetchAnciennesCommuneByCodeCommune,
  fetchArrondissementIndexedByCodeCommune,
  fetchCollectivitesOutreMer,
} from "@/services/apis/insee/insee.js";
import { fetchDepartementMissionLocale } from "@/services/apis/unml/unml.js";
import { withCause } from "@/services/errors/withCause.js";
import parentLogger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

const logger = parentLogger.child({ module: "import:communes" });

// Supprime les accents et les caractères spéciaux
function normaliseNomCommune(nom: string) {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function findCommuneMissionLocale(
  commune: ISourceGeoCommune,
  payload: ISourceUnmlPayload
): ISourceMissionLocale | null {
  const missionLocaleFromCodePostal = payload.results.filter((r) => commune.codesPostaux.includes(r.codePostal));

  if (missionLocaleFromCodePostal.length === 0) {
    return null;
  }

  const structureIds = new Set(missionLocaleFromCodePostal.map((ml) => ml.structureId));
  if (structureIds.size === 1) {
    return missionLocaleFromCodePostal[0].structure;
  }

  const normalizedNomCommune = normaliseNomCommune(commune.nom);
  const mlCommuneByNom = missionLocaleFromCodePostal.filter(
    (ml) => normaliseNomCommune(ml.ville) === normalizedNomCommune
  );

  if (mlCommuneByNom.length === 1) {
    return mlCommuneByNom[0].structure;
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

    const [regions, collectivites, academies, arrondissementsInsee, anciennes] = await Promise.all([
      fetchGeoRegions(),
      fetchCollectivitesOutreMer().then(async (collectivites) =>
        Promise.all(collectivites.map((c) => fetchGeoRegion(c.code)))
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
        const [geoCommunes, missionLocalePayload] = await Promise.all([
          fetchGeoCommunes(departement.code),
          fetchDepartementMissionLocale(departement.code),
        ]);

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
          const sourceMl = findCommuneMissionLocale(geoCommune, missionLocalePayload);
          const mission_locale: ICommune["mission_locale"] =
            sourceMl == null
              ? null
              : {
                  id: sourceMl.id,
                  nom: sourceMl.nomStructure,
                  siret: sourceMl.siret,
                  localisation: {
                    geopoint:
                      sourceMl.geoloc_lng == null || sourceMl.geoloc_lat == null
                        ? null
                        : {
                            type: "Point",
                            coordinates: [parseFloat(sourceMl.geoloc_lng), parseFloat(sourceMl.geoloc_lat)],
                          },
                    adresse: sourceMl.adresse1,
                    cp: sourceMl.cp,
                    ville: sourceMl.ville,
                  },
                  contact: {
                    email: sourceMl.emailAccueil,
                    telephone: sourceMl.telephones,
                    siteWeb: sourceMl.siteWeb,
                  },
                };

          communes.push({
            nom: geoCommune.nom,
            code: { insee: geoCommune.code, postaux: geoCommune.codesPostaux },
            departement: {
              nom: departement.nom,
              codeInsee: departement.code,
            },
            anciennes:
              anciennes[geoCommune.code]?.map(({ code, intitule }) => ({ codeInsee: code, nom: intitule })) ?? [],
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
