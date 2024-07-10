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

  const organismesOuverts = organismes.filter((organisme) => organisme.data.etat_administratif === "actif");

  if (organismes.length === 1) {
    return organismes[0].data.etat_administratif === "actif"
      ? { state: "referentiel-fraterie-uai-unique", organisme: organismes[0].data }
      : { state: "referentiel-fraterie-uai-unique-ferme", organisme: organismes[0].data };
  }

  if (organismesOuverts.length === 1) {
    return {
      state: "referentiel-fraterie-uai-multiple-ouvert-unique",
      organisme: organismesOuverts[0].data,
      organismes: organismes.map((organisme) => organisme.data),
    };
  }

  return { state: "referentiel-fraterie-uai-multiple", organismes: organismes.map((organisme) => organisme.data) };
}
