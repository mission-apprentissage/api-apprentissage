import { getDbCollection } from "@/services/mongodb/mongodbService";
import { IRechercheParUaiResult, SearchCriteria } from "@/services/organisme/types";

export async function rechercheOrganismeParUai(criteria: SearchCriteria): Promise<IRechercheParUaiResult> {
  const organismes = await getDbCollection("source.referentiel")
    .find({
      "data.uai": criteria.uai,
      "data.siret": { $ne: criteria.siret },
    })
    .toArray();

  if (organismes.length === 0) {
    return { state: "referentiel-fraterie-uai-aucun" };
  }

  return organismes.length === 1
    ? { state: "referentiel-fraterie-uai-unique", organisme: organismes[0].data }
    : { state: "referentiel-fraterie-uai-multiple", organismes: organismes.map((organisme) => organisme.data) };
}
