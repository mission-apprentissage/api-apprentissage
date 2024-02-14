import parentLogger from "@/common/logger";

import { fetchReferentielOrganismes } from "../../../../common/apis/referentiel/referentiel";
import { getDbCollection } from "../../../../common/utils/mongodbUtils";

const logger = parentLogger.child({ module: "import:referentiel" });

export async function runReferentielImporter() {
  logger.info("Geting Referentiel ...");

  const organismes = await fetchReferentielOrganismes();
  await getDbCollection("source.referentiel").insertMany(organismes);
}
