import { captureException } from "@sentry/node";
import { ObjectId } from "mongodb";
import { zSourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";

import parentLogger from "@/common/logger";

import { fetchReferentielOrganismes } from "../../../../common/apis/referentiel/referentiel";
import { getDbCollection } from "../../../../common/utils/mongodbUtils";

const logger = parentLogger.child({ module: "import:referentiel" });

export async function runReferentielImporter() {
  logger.info("Geting Referentiel ...");

  const importDate = new Date();

  const organismes = await fetchReferentielOrganismes();

  try {
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
  } catch (error) {
    captureException(error);
    logger.error(error);
  }
}
