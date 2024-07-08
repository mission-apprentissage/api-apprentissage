import { getDbCollection } from "@/services/mongodb/mongodbService";
import { IRechercheParSiretResult, SearchCriteria } from "@/services/organisme/types";

export async function rechercheOrganismeParSiret(criteria: SearchCriteria): Promise<IRechercheParSiretResult> {
  const organismes = await getDbCollection("source.referentiel")
    .find({
      "data.siret": criteria.siret,
      "data.uai": { $ne: criteria.uai },
    })
    .toArray();

  if (organismes.length === 0) {
    return { state: "referentiel-fraterie-siret-aucun" };
  }

  return organismes.length === 1
    ? { state: "referentiel-fraterie-siret-unique", organisme: organismes[0].data }
    : { state: "referentiel-fraterie-siret-multiple", organismes: organismes.map((organisme) => organisme.data) };
}
