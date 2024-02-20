import { ObjectId } from "mongodb";
import { oleoduc, writeData } from "oleoduc";
import {
  IFormationCatalogue,
  IGeoPoint,
  zFormationCatalogue,
  zSourceCatalogue,
} from "shared/models/source/catalogue/source.catalogue.model";

import parentLogger from "@/common/logger";

import { getAllFormationsFromCatalogue } from "../../../../common/apis/catalogue/catalogue";
import { getDbCollection } from "../../../../common/utils/mongodbUtils";

const logger = parentLogger.child({ module: "import:catalogue" });

const convertStringCoordinatesToGeoPoint = (coordinates: string): IGeoPoint => {
  const coords = coordinates.split(",");

  return {
    type: "Point",
    coordinates: [parseFloat(coords[1]), parseFloat(coords[0])],
  };
};

const getCatalogueFormations = async () => {
  const stats = {
    total: 0,
    created: 0,
    failed: 0,
  };
  try {
    const formations = [] as IFormationCatalogue[];
    await oleoduc(
      await getAllFormationsFromCatalogue(),
      writeData(async (formation: any) => {
        stats.total++;
        try {
          // use MongoDB to add only add selected field from getAllFormationFromCatalogue() function and speedup the process
          delete formation._id; // break parsing / insertion otherwise
          formation.lieu_formation_geopoint = convertStringCoordinatesToGeoPoint(
            formation.lieu_formation_geo_coordonnees
          );
          const parsedFormation = zFormationCatalogue.parse(formation);
          formations.push(parsedFormation);
          stats.created++;
        } catch (e) {
          logger.error("Erreur enregistrement de formation", e);
          stats.failed++;
        }
      }),
      { parallel: 500 }
    );

    return { stats, formations };
  } catch (error) {
    // stop here if not able to get trainings (keep existing ones)
    logger.error(`Error fetching formations from Catalogue`, error);
    throw new Error("Error fetching formations from Catalogue");
  }
};

export async function runCatalogueImporter() {
  logger.info("Geting Catalogue ...");

  const importDate = new Date();

  const { stats, formations } = await getCatalogueFormations();

  const toInsert = formations.map((data) =>
    zSourceCatalogue.parse({
      _id: new ObjectId(),
      date: importDate,
      data,
    })
  );

  await getDbCollection("source.catalogue").insertMany(toInsert);

  await getDbCollection("source.catalogue").deleteMany({
    date: { $ne: importDate },
  });

  return {
    nb_formations: stats.created,
    erreurs: stats.failed,
  };
}
