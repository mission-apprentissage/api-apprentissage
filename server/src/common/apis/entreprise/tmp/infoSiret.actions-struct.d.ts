import { ApiEntEtablissement } from "../entreprise";
interface result extends ApiEntEtablissement {
  siret?: string;
  naf_code?: string;
  enseigne?: string;
  raison_sociale?: string;
  tranche_effectif_salarie_etablissement?: {
    de?: number;
  };
  numero_voie?: number;
  voie_complete?: string;
  complement_adresse?: string;
  code_postal?: string;
  code_insee_localite?: string;
  localite?: string;
  num_departement?: string;
  num_region?: string;
  num_academie?: string;
  adresse?: string;
  type_voie?: string;
  nom_voie?: string;
  ferme?: boolean;
}

export type InfoSiret =
  | {
      result: result;
    }
  | {
      result: null;
      error: {
        message: string;
        secret_siret?: boolean;
        api_entreprise_status?: "OK" | "KO";
      };
    };
