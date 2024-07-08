import { getDbCollection } from "@/services/mongodb/mongodbService";
import { IRechercheParLieuResult, SearchCriteria } from "@/services/organisme/types";

export async function rechercheOrganismeParLieu(criteria: SearchCriteria): Promise<IRechercheParLieuResult> {
  const results = await getDbCollection("source.referentiel")
    .find({
      "data.lieux_de_formation.uai": criteria.uai,
    })
    .toArray();
  const organismes = results.map((result) => result.data);

  if (organismes.length === 0) {
    return { state: "referentiel-par-lieu-org-introuvable" };
  }

  const memeSiret = organismes.filter((organisme) => organisme.siret === criteria.siret);

  if (memeSiret.length === 1) {
    return { state: "referentiel-par-lieu-org-unique", organisme: memeSiret[0] };
  }

  if (memeSiret.length > 1) {
    return { state: "referentiel-par-lieu-org-multiple", organismes: memeSiret };
  }

  const memeSiretResponsable = organismes.flatMap((organisme) => {
    return (
      organisme.relations
        ?.filter((relation) => {
          return relation?.siret === criteria.siret && relation?.type === "formateur->responsable";
        })
        .map((r) => r.siret) ?? []
    );
  });

  if (memeSiretResponsable.length === 0) {
    return organismes.length === 1
      ? { state: "referentiel-par-lieu-org-incompatible-unique", organisme: organismes[0] }
      : { state: "referentiel-par-lieu-incompatible", organismes };
  }

  const responsables = await getDbCollection("source.referentiel")
    .find({
      "data.siret": { $in: memeSiretResponsable },
    })
    .toArray();

  return {
    state:
      responsables.length === 1
        ? "referentiel-par-lieu-responsable-unique"
        : "referentiel-par-lieu-responsable-multiple",
    organismes: [...responsables.map((r) => r.data), ...organismes],
  };
}
