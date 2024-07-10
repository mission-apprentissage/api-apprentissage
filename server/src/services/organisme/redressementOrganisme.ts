import { rechercheOrganismeParLieu } from "./rules/rechercheParLieu";
import { rechercheOrganismeParSiret } from "./rules/rechercheParSiret";
import { rechercheOrganismeParUai } from "./rules/rechercheParUai";
import { rechercheOrganismeSimple } from "./rules/rechercheSimple";
import { SearchCriteria, SearchResult } from "./types";

async function rechercheOrganisme(criteria: SearchCriteria): Promise<SearchResult> {
  const [simple, parSiret, parUai, parLieu] = await Promise.all([
    rechercheOrganismeSimple(criteria),
    rechercheOrganismeParSiret(criteria),
    rechercheOrganismeParUai(criteria),
    rechercheOrganismeParLieu(criteria),
  ]);

  const motifs = [simple, parSiret, parUai, parLieu];

  if (simple.state === "referentiel-org-ouvert") {
    return {
      status: "success",
      organisme: simple.organisme,
      motifs,
    };
  }

  if (parUai.state === "referentiel-fraterie-uai-unique" && parSiret.state === "referentiel-fraterie-siret-aucun") {
    return {
      status: "success",
      organisme: parUai.organisme,
      motifs,
    };
  }

  if (parLieu.state === "referentiel-par-lieu-org-unique") {
    return {
      status: "success",
      organisme: parLieu.organisme,
      motifs,
    };
  }

  if (
    parLieu.state === "referentiel-par-lieu-org-incompatible-unique" &&
    parSiret.state === "referentiel-fraterie-siret-aucun"
  ) {
    return {
      status: "success",
      organisme: parLieu.organisme,
      motifs,
    };
  }

  if (
    parLieu.state === "referentiel-par-lieu-responsable-unique" &&
    parUai.state === "referentiel-fraterie-uai-aucun"
  ) {
    return {
      status: "success",
      organisme: parLieu.organisme,
      motifs,
    };
  }

  return {
    status: "failure",
    organisme: null,
    motifs,
  };
}

async function controleOrganisme(result: SearchResult): Promise<SearchResult> {
  if (result.status === "failure") {
    return result;
  }

  if (!result.organisme.uai) {
    return {
      status: "failure",
      organisme: null,
      motifs: [
        ...result.motifs,
        {
          state: "controle-uai-inconnu",
        },
      ],
    };
  }

  return result;
}

export async function redressementOrganisme(criteria: SearchCriteria): Promise<SearchResult> {
  return await controleOrganisme(await rechercheOrganisme(criteria));
}
