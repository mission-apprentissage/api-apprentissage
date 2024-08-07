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
        | "referentiel-par-lieu-responsable-unique-ferme"
        | "referentiel-par-lieu-responsable-multiple";
      organismes: IOrganismeReferentiel[];
    }
  | {
      state:
        | "referentiel-par-lieu-org-unique"
        | "referentiel-par-lieu-org-incompatible-unique"
        | "referentiel-par-lieu-responsable-unique";
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
      state: "referentiel-fraterie-uai-unique" | "referentiel-fraterie-uai-unique-ferme";
      organisme: IOrganismeReferentiel;
    }
  | {
      state: "referentiel-fraterie-uai-multiple-ouvert-unique";
      organisme: IOrganismeReferentiel;
      organismes: IOrganismeReferentiel[];
    };

export type IRechercheSimpleResult =
  | {
      state: "referentiel-org-ferme" | "referentiel-org-ouvert";
      organisme: IOrganismeReferentiel;
    }
  | { state: "referentiel-org-introuvable" };

export type IControleNatureInconnue =
  | {
      state: "controle-siret-fermé";
    }
  | {
      state: "controle-uai-inconnu";
    };

type ISeachResultMotif =
  | IRechercheParLieuResult
  | IRechercheParSiretResult
  | IRechercheParUaiResult
  | IRechercheSimpleResult
  | IControleNatureInconnue;

export type SearchResult =
  | {
      status: "success";
      organisme: IOrganismeReferentiel;
      motifs: ISeachResultMotif[];
    }
  | {
      status: "failure";
      organisme: null;
      motifs: ISeachResultMotif[];
    };
