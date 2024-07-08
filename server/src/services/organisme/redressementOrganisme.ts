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
      candidats: [],
      motifs,
    };
  }

  if (parUai.state === "referentiel-fraterie-uai-unique" && parSiret.state === "referentiel-fraterie-siret-aucun") {
    return {
      status: "success",
      organisme: parUai.organisme,
      candidats: [],
      motifs,
    };
  }

  if (parLieu.state === "referentiel-par-lieu-org-unique") {
    return {
      status: "success",
      organisme: parLieu.organisme,
      candidats: [],
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
      candidats: [],
      motifs,
    };
  }

  // if (simple.state === "referentiel-org-ferme") {
  //   return {
  //     status: "success",
  //     organisme: simple.organisme,
  //     candidats: [],
  //     motifs,
  //   };
  // }

  if (parLieu.state === "referentiel-par-lieu-org-multiple") {
    return {
      status: "failure",
      organisme: null,
      candidats: parLieu.organismes,
      motifs,
    };
  }

  // if (
  //   parLieu.state === "referentiel-par-lieu-org-introuvable" &&
  //   parUai.state === "referentiel-fraterie-uai-aucun" &&
  //   parSiret.state === "referentiel-fraterie-siret-unique"
  // ) {
  //   return {
  //     status: "success",
  //     organisme: parSiret.organisme,
  //     candidats: [],
  //     motifs,
  //   };
  // }

  if (parLieu.state === "referentiel-par-lieu-incompatible" && parSiret.state === "referentiel-fraterie-siret-unique") {
    return {
      status: "failure",
      organisme: null,
      candidats: [...parLieu.organismes, parSiret.organisme],
      motifs,
    };
  }

  if (
    parLieu.state === "referentiel-par-lieu-org-incompatible-unique" &&
    parSiret.state === "referentiel-fraterie-siret-unique"
  ) {
    return {
      status: "failure",
      organisme: null,
      candidats: [parLieu.organisme, parSiret.organisme],
      motifs,
    };
  }

  return {
    status: "failure",
    organisme: null,
    candidats: [],
    motifs,
  };
}

async function controleOrganisme(result: SearchResult): Promise<SearchResult> {
  if (result.status === "failure") {
    return result;
  }

  // if (result.organisme.nature === "inconnue") {
  //   return {
  //     status: "failure",
  //     organisme: null,
  //     candidats: [],
  //     motifs: [...result.motifs, SEARCH_RESULT_REASONS.nature_inconnue],
  //   };
  // }

  return result;
}

export async function redressementOrganisme(criteria: SearchCriteria): Promise<SearchResult> {
  return await controleOrganisme(await rechercheOrganisme(criteria));
}
