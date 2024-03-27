import { ObjectId } from "mongodb";
import { zSourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";

import parentLogger from "@/services/logger";

import { fetchReferentielOrganismes } from "../../../services/apis/referentiel/referentiel";
import { getDbCollection } from "../../../services/mongodb/mongodbService";

const logger = parentLogger.child({ module: "import:referentiel" });

export async function runReferentielImporter() {
  logger.info("Geting Referentiel ...");

  const importDate = new Date();

  const organismes = await fetchReferentielOrganismes();

  const toInsert = organismes.map((data) =>
    zSourceReferentiel.parse({
      _id: new ObjectId(),
      date: importDate,
      data,
    })
  );

  await getDbCollection("source.referentiel").insertMany(toInsert);

  await getDbCollection("source.referentiel").deleteMany({
    date: { $ne: importDate },
  });
}
