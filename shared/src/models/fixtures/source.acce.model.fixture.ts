import { ObjectId } from "bson";

import type {
  ISourceAcceUai,
  ISourceAcceUaiFille,
  ISourceAcceUaiMere,
  ISourceAcceUaiSpec,
  ISourceAcceUaiZone,
} from "../source/acce/source.acce.model.js";
import { getFixtureValue } from "./fixture_helper.js";

type ISourceAcceUaiInput = Partial<
  Omit<ISourceAcceUai, "data"> & {
    data?: Partial<ISourceAcceUai["data"]>;
  }
>;

function generateSourceAcceBaseDataFixture(
  data?: Partial<Omit<ISourceAcceUai["data"], "numero_uai">>
): Omit<ISourceAcceUai["data"], "numero_uai"> {
  return {
    nature_uai: getFixtureValue(data, "nature_uai", "340"),
    nature_uai_libe: getFixtureValue(data, "nature_uai_libe", "Collège"),
    type_uai: getFixtureValue(data, "type_uai", "CLG"),
    type_uai_libe: getFixtureValue(data, "type_uai_libe", "Collèges"),
    etat_etablissement: getFixtureValue(data, "etat_etablissement", "1"),
    etat_etablissement_libe: getFixtureValue(data, "etat_etablissement_libe", "Ouvert"),
    ministere_tutelle: getFixtureValue(data, "ministere_tutelle", "06"),
    ministere_tutelle_libe: getFixtureValue(data, "ministere_tutelle_libe", "ministère de l'éducation nationale"),
    tutelle_2: getFixtureValue(data, "tutelle_2", null),
    tutelle_2_libe: getFixtureValue(data, "tutelle_2_libe", null),
    secteur_public_prive: getFixtureValue(data, "secteur_public_prive", "PU"),
    secteur_public_prive_libe: getFixtureValue(data, "secteur_public_prive_libe", "Public"),
    sigle_uai: getFixtureValue(data, "sigle_uai", "CLG"),
    categorie_juridique: getFixtureValue(data, "categorie_juridique", "200"),
    categorie_juridique_libe: getFixtureValue(
      data,
      "categorie_juridique_libe",
      "Etablissement public local d'enseignement (EPLE)"
    ),
    contrat_etablissement: getFixtureValue(data, "contrat_etablissement", "99"),
    contrat_etablissement_libe: getFixtureValue(data, "contrat_etablissement_libe", "Sans objet"),
    categorie_financiere: getFixtureValue(data, "categorie_financiere", "3"),
    categorie_financiere_libe: getFixtureValue(data, "categorie_financiere_libe", "3"),
    situation_comptable: getFixtureValue(data, "situation_comptable", "3"),
    situation_comptable_libe: getFixtureValue(data, "situation_comptable_libe", "Rattaché à une agence comptable"),
    niveau_uai: getFixtureValue(data, "niveau_uai", "2"),
    niveau_uai_libe: getFixtureValue(data, "niveau_uai_libe", "UAI mère"),
    commune: getFixtureValue(data, "commune", "02304"),
    commune_libe: getFixtureValue(data, "commune_libe", "La Fère"),
    academie: getFixtureValue(data, "academie", "20"),
    academie_libe: getFixtureValue(data, "academie_libe", "Amiens"),
    pays: getFixtureValue(data, "pays", "100"),
    pays_libe: getFixtureValue(data, "pays_libe", "France"),
    departement_insee_3: getFixtureValue(data, "departement_insee_3", "002"),
    departement_insee_3_libe: getFixtureValue(data, "departement_insee_3_libe", "Aisne"),
    denomination_principale: getFixtureValue(data, "denomination_principale", "COLLEGE"),
    appellation_officielle: getFixtureValue(data, "appellation_officielle", "Collège Marie de Luxembourg"),
    patronyme_uai: getFixtureValue(data, "patronyme_uai", "MARIE DE LUXEMBOURG"),
    hebergement_etablissement: getFixtureValue(data, "hebergement_etablissement", "22"),
    hebergement_etablissement_libe: getFixtureValue(
      data,
      "hebergement_etablissement_libe",
      "Avec internat et demi-pension"
    ),
    numero_siren_siret_uai: getFixtureValue(data, "numero_siren_siret_uai", "19021518600015"),
    numero_finess_uai: getFixtureValue(data, "numero_finess_uai", null),
    date_ouverture: getFixtureValue(data, "date_ouverture", "09/07/1969"),
    date_fermeture: getFixtureValue(data, "date_fermeture", null),
    date_derniere_mise_a_jour: getFixtureValue(data, "date_derniere_mise_a_jour", "09/02/2024"),
    lieu_dit_uai: getFixtureValue(data, "lieu_dit_uai", null),
    adresse_uai: getFixtureValue(data, "adresse_uai", "14 rue du Maréchal Juin"),
    boite_postale_uai: getFixtureValue(data, "boite_postale_uai", null),
    code_postal_uai: getFixtureValue(data, "code_postal_uai", "02800"),
    etat_sirad_uai: getFixtureValue(data, "etat_sirad_uai", "1"),
    localite_acheminement_uai: getFixtureValue(data, "localite_acheminement_uai", "LA FERE"),
    pays_etranger_acheminement: getFixtureValue(data, "pays_etranger_acheminement", null),
    numero_telephone_uai: getFixtureValue(data, "numero_telephone_uai", "03 23 56 21 29"),
    numero_telecopieur_uai: getFixtureValue(data, "numero_telecopieur_uai", "03 23 56 71 78"),
    mention_distribution: getFixtureValue(data, "mention_distribution", null),
    mel_uai: getFixtureValue(data, "mel_uai", "ce.0021518P@ac-amiens.fr"),
    site_web: getFixtureValue(data, "site_web", null),
    coordonnee_x: getFixtureValue(data, "coordonnee_x", 726301.2),
    coordonnee_y: getFixtureValue(data, "coordonnee_y", 6951710.5),
    appariement: getFixtureValue(data, "appariement", "Parfaite"),
    appariement_complement: getFixtureValue(data, "appariement_complement", null),
    localisation: getFixtureValue(data, "localisation", "Numéro de rue"),
    localisation_complement: getFixtureValue(data, "localisation_complement", null),
    date_geolocalisation: getFixtureValue(data, "date_geolocalisation", "30/01/2024"),
    source: getFixtureValue(data, "source", "IGN"),
  };
}

export function generateSourceAcceUaiDataFixture(data?: Partial<ISourceAcceUai["data"]>): ISourceAcceUai["data"] {
  return {
    ...generateSourceAcceBaseDataFixture(data),
    numero_uai: getFixtureValue(data, "numero_uai", "0021518P"),
  };
}

export function generateSourceAcceUaiFixture(input: ISourceAcceUaiInput): ISourceAcceUai {
  return {
    _id: getFixtureValue(input, "_id", new ObjectId()),
    source: "ACCE_UAI.csv",
    date: getFixtureValue(input, "date", new Date("2024-03-07T00:00:00Z")),
    data: generateSourceAcceUaiDataFixture(input.data),
  };
}

type ISourceAcceZoneInput = Partial<
  Omit<ISourceAcceUaiZone, "data"> & {
    data?: Partial<ISourceAcceUaiZone["data"]>;
  }
>;

export function generateSourceAcceZoneDataFixture(
  data?: Partial<ISourceAcceUaiZone["data"]>
): ISourceAcceUaiZone["data"] {
  return {
    numero_uai: getFixtureValue(data, "numero_uai", "0021518P"),
    type_zone_uai: getFixtureValue(data, "type_zone_uai", "25"),
    type_zone_uai_libe: getFixtureValue(data, "type_zone_uai_libe", "Zone d'animation pédagogique"),
    zone: getFixtureValue(data, "zone", "002001"),
    zone_libe: getFixtureValue(data, "zone_libe", "BEF SAINT QUENTIN - CHAUNY"),
    date_ouverture: getFixtureValue(data, "date_ouverture", "01/01/2006"),
    date_fermeture: getFixtureValue(data, "date_fermeture", "31/08/2023"),
    date_derniere_mise_a_jour: getFixtureValue(data, "date_derniere_mise_a_jour", null),
  };
}

export function generateSourceAcceZoneFixture(input: ISourceAcceZoneInput): ISourceAcceUaiZone {
  return {
    _id: getFixtureValue(input, "_id", new ObjectId()),
    source: "ACCE_UAI_ZONE.csv",
    date: getFixtureValue(input, "date", new Date("2024-03-07T00:00:00Z")),
    data: generateSourceAcceZoneDataFixture(input.data),
  };
}

type ISouceAcceSpecInput = Partial<
  Omit<ISourceAcceUaiSpec, "data"> & {
    data?: Partial<ISourceAcceUaiSpec["data"]>;
  }
>;

export function generateSourceAcceSpecDataFixture(
  data?: Partial<ISourceAcceUaiSpec["data"]>
): ISourceAcceUaiSpec["data"] {
  return {
    numero_uai: getFixtureValue(data, "numero_uai", "0021518P"),
    specificite_uai: getFixtureValue(data, "specificite_uai", "INX"),
    specificite_uai_libe: getFixtureValue(data, "specificite_uai_libe", "Internat d'excellence 2021"),
    date_ouverture: getFixtureValue(data, "date_ouverture", "01/09/2021"),
    date_fermeture: getFixtureValue(data, "date_fermeture", null),
  };
}

export function generateSourceAcceSpecFixture(input: ISouceAcceSpecInput): ISourceAcceUaiSpec {
  return {
    _id: getFixtureValue(input, "_id", new ObjectId()),
    source: "ACCE_UAI_SPEC.csv",
    date: getFixtureValue(input, "date", new Date("2024-03-07T00:00:00Z")),
    data: generateSourceAcceSpecDataFixture(input.data),
  };
}

type ISourceAcceMereInput = Partial<
  Omit<ISourceAcceUaiMere, "data"> & {
    data?: Partial<ISourceAcceUaiMere["data"]>;
  }
>;

export function generateSourceAcceMereDataFixture(
  data?: Partial<ISourceAcceUaiMere["data"]>
): ISourceAcceUaiMere["data"] {
  return {
    ...generateSourceAcceBaseDataFixture(data),
    numero_uai_trouve: getFixtureValue(data, "numero_uai_trouve", "0021518P"),
    type_rattachement: getFixtureValue(data, "type_rattachement", "AN"),
    numero_uai_mere: getFixtureValue(data, "numero_uai_mere", "0021518P"),
  };
}

export function generateSourceAcceMereFixture(input: ISourceAcceMereInput): ISourceAcceUaiMere {
  return {
    _id: getFixtureValue(input, "_id", new ObjectId()),
    source: "ACCE_UAI_MERE.csv",
    date: getFixtureValue(input, "date", new Date("2024-03-07T00:00:00Z")),
    data: generateSourceAcceMereDataFixture(input.data),
  };
}

type ISourceAcceFilleInput = Partial<
  Omit<ISourceAcceUaiFille, "data"> & {
    data?: Partial<ISourceAcceUaiFille["data"]>;
  }
>;

export function generateSourceAcceFilleDataFixture(
  data?: Partial<ISourceAcceUaiFille["data"]>
): ISourceAcceUaiFille["data"] {
  return {
    ...generateSourceAcceBaseDataFixture(data),
    numero_uai_trouve: getFixtureValue(data, "numero_uai_trouve", "0021518P"),
    type_rattachement: getFixtureValue(data, "type_rattachement", "AN"),
    numero_uai_fille: getFixtureValue(data, "numero_uai_fille", "0021518P"),
  };
}

export function generateSourceAcceFilleFixture(input: ISourceAcceFilleInput): ISourceAcceUaiFille {
  return {
    _id: getFixtureValue(input, "_id", new ObjectId()),
    source: "ACCE_UAI_FILLE.csv",
    date: getFixtureValue(input, "date", new Date("2024-03-07T00:00:00Z")),
    data: generateSourceAcceFilleDataFixture(input.data),
  };
}
