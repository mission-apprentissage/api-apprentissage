import { IOrganismeReferentiel } from "shared/models/source/referentiel/source.referentiel.model";

export type SearchCriteria = {
  uai: string;
  siret: string;
};

export type IRechercheParLieuResult =
  | {
      state: "referentiel-par-lieu-org-introuvable";
    }
  | {
      state:
        | "referentiel-par-lieu-incompatible"
        | "referentiel-par-lieu-responsable-unique"
        | "referentiel-par-lieu-responsable-multiple";
      organismes: IOrganismeReferentiel[];
    }
  | {
      state: "referentiel-par-lieu-org-unique" | "referentiel-par-lieu-org-incompatible-unique";
      organisme: IOrganismeReferentiel;
    }
  | {
      state: "referentiel-par-lieu-org-multiple";
      organismes: IOrganismeReferentiel[];
    };

export type IRechercheParSiretResult =
  | {
      state: "referentiel-fraterie-siret-aucun";
    }
  | {
      state: "referentiel-fraterie-siret-multiple";
      organismes: IOrganismeReferentiel[];
    }
  | {
      state: "referentiel-fraterie-siret-unique";
      organisme: IOrganismeReferentiel;
    };

export type IRechercheParUaiResult =
  | {
      state: "referentiel-fraterie-uai-aucun";
    }
  | {
      state: "referentiel-fraterie-uai-multiple";
      organismes: IOrganismeReferentiel[];
    }
  | {
      state: "referentiel-fraterie-uai-unique";
      organisme: IOrganismeReferentiel;
    };

export type IRechercheSimpleResult =
  | {
      state: "referentiel-org-ferme" | "referentiel-org-ouvert";
      organisme: IOrganismeReferentiel;
    }
  | { state: "referentiel-org-introuvable" };

type ISeachResultMotif =
  | IRechercheParLieuResult
  | IRechercheParSiretResult
  | IRechercheParUaiResult
  | IRechercheSimpleResult;

export type SearchResult =
  | {
      status: "success";
      organisme: IOrganismeReferentiel;
      candidats: IOrganismeReferentiel[];
      motifs: ISeachResultMotif[];
    }
  | {
      status: "failure";
      organisme: null;
      candidats: IOrganismeReferentiel[];
      motifs: ISeachResultMotif[];
    };
