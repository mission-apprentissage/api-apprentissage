import { getDbCollection } from "@/services/mongodb/mongodbService";
import { IRechercheSimpleResult, SearchCriteria } from "@/services/organisme/types";

export async function rechercheOrganismeSimple(criteria: SearchCriteria): Promise<IRechercheSimpleResult> {
  const organisme = await getDbCollection("source.referentiel").findOne({
    "data.uai": criteria.uai,
    "data.siret": criteria.siret,
  });

  if (!organisme) {
    return { state: "referentiel-org-introuvable" };
  }

  return {
    state: organisme.data.etat_administratif === "actif" ? "referentiel-org-ouvert" : "referentiel-org-ferme",
    organisme: organisme.data,
  };
}
