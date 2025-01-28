import type { IOrganisme } from "api-alternance-sdk";
import { ObjectId } from "mongodb";
import type { IApiEntEtablissement, IApiEntUniteLegale } from "shared/models/cache/cache.entreprise.model";
import type { ICommuneInternal } from "shared/models/commune.model";
import { generateOrganismeReferentielFixture } from "shared/models/fixtures/source.referentiel.model.fixture";
import type { IOrganismeReferentiel } from "shared/models/source/referentiel/source.referentiel.model";

export const sourceReferentielFixtures: IOrganismeReferentiel[] = [
  generateOrganismeReferentielFixture({
    siret: "13002975400020",
    numero_declaration_activite: "32591104359",
    qualiopi: true,
    uai: "0597114M",
    contacts: [
      {
        email: "contact@mail.com",
        confirmé: true,
        sources: ["source1", "source2"],
      },
      {
        email: "invalideEmail",
      },
      {
        email: "notConfirmed@mail.com",
      },
    ],
  }),
  generateOrganismeReferentielFixture({
    siret: "26220009000278",
    uai: "0932751K",
  }),
];

export const etablissementsFixture: IApiEntEtablissement[] = [
  {
    siret: "13002975400020",
    etat_administratif: "A",
    date_fermeture: null,
    enseigne: "FACULTE SCIENCES SPORT ET EDUCATION PHYSIQUE",
    date_creation: 1640991600,
    unite_legale: {
      siren: "130029754",
      type: "personne_morale",
      personne_morale_attributs: {
        raison_sociale: "UNIVERSITE DE LILLE",
        sigle: null,
      },
      personne_physique_attributs: {
        prenom_usuel: null,
        nom_usage: null,
      },
      date_creation: 1632261600,
      etat_administratif: "A",
    },
    adresse: {
      complement_adresse: null,
      numero_voie: "9",
      indice_repetition_voie: null,
      type_voie: "RUE",
      libelle_voie: "DE L'UNIVERSITE",
      code_postal: "59790",
      libelle_commune: "RONCHIN",
      libelle_commune_etranger: null,
      code_commune: "59507",
      code_pays_etranger: null,
      libelle_pays_etranger: null,
    },
  },
  {
    siret: "26220009000278",
    etat_administratif: "A",
    date_fermeture: null,
    enseigne: "ECOLE D'AIDE SOIGNANTS",
    date_creation: 1704063600,
    unite_legale: {
      siren: "262200090",
      type: "personne_morale",
      personne_morale_attributs: {
        raison_sociale: "CENTRE HOSPITALIER DE SAINT-BRIEUC, PAIMPOL ET TREGUIER",
        sigle: null,
      },
      personne_physique_attributs: {
        prenom_usuel: null,
        nom_usage: null,
      },
      date_creation: -2177453361,
      etat_administratif: "A",
    },
    adresse: {
      complement_adresse: null,
      numero_voie: null,
      indice_repetition_voie: null,
      type_voie: null,
      libelle_voie: "TOUR SAINT MICHEL",
      code_postal: "22220",
      libelle_commune: "TREGUIER",
      libelle_commune_etranger: null,
      code_commune: "22362",
      code_pays_etranger: null,
      libelle_pays_etranger: null,
    },
  },
  {
    siret: "91062122600018",
    etat_administratif: "F",
    date_fermeture: 1693260000,
    enseigne: null,
    date_creation: 1641769200,
    unite_legale: {
      siren: "910621226",
      type: "personne_morale",
      personne_morale_attributs: {
        raison_sociale: "J&M CONSEIL ET FORMATION",
        sigle: null,
      },
      personne_physique_attributs: {
        prenom_usuel: null,
        nom_usage: null,
      },
      date_creation: 1641769200,
      etat_administratif: "A",
    },
    adresse: {
      complement_adresse: "BUREAU 3",
      numero_voie: "38",
      indice_repetition_voie: null,
      type_voie: "BOULEVARD",
      libelle_voie: "CARNOT",
      code_postal: "59800",
      libelle_commune: "LILLE",
      libelle_commune_etranger: null,
      code_commune: "59350",
      code_pays_etranger: null,
      libelle_pays_etranger: null,
    },
  },
  {
    siret: "88430519400018",
    etat_administratif: "F",
    date_fermeture: 1727474400,
    enseigne: "EMMENO - LE SUCCES EST LE FRUIT DE LA PERSEVERANCE",
    date_creation: 1591826400,
    unite_legale: {
      siren: "884305194",
      type: "personne_morale",
      personne_morale_attributs: {
        raison_sociale: "EMMENO PRESTIGE SCHOOL",
        sigle: null,
      },
      personne_physique_attributs: {
        prenom_usuel: null,
        nom_usage: null,
      },
      date_creation: 1591826400,
      etat_administratif: "C",
    },
    adresse: {
      complement_adresse: null,
      numero_voie: "40",
      indice_repetition_voie: null,
      type_voie: "PLACE",
      libelle_voie: "DU THEATRE",
      code_postal: "59800",
      libelle_commune: "LILLE",
      libelle_commune_etranger: null,
      code_commune: "59350",
      code_pays_etranger: null,
      libelle_pays_etranger: null,
    },
  },
];

export const etablissementNotFoundSiret = "19593255300108";

export const uniteLegaleFixture: IApiEntUniteLegale[] = [
  {
    ...etablissementsFixture[0].unite_legale,
    date_cessation: null,
  },
  {
    ...etablissementsFixture[1].unite_legale,
    date_cessation: null,
  },
  {
    ...etablissementsFixture[2].unite_legale,
    date_cessation: null,
  },
  {
    ...etablissementsFixture[3].unite_legale,
    date_cessation: 1727474400,
  },
  {
    siren: "195932553",
    type: "personne_morale",
    personne_morale_attributs: {
      raison_sociale: "ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLE DE DOUAI",
      sigle: "EPLEFPA",
    },
    personne_physique_attributs: {
      prenom_usuel: null,
      nom_usage: null,
    },
    etat_administratif: "A",
    date_cessation: null,
    date_creation: -33958800,
  },
];

export const communesFixture: ICommuneInternal[] = [
  {
    _id: new ObjectId(),
    code: {
      insee: "59507",
      postaux: ["59790"],
    },
    academie: {
      nom: "Lille",
      id: "A09",
      code: "09",
    },
    created_at: new Date("2024-11-28"),
    departement: {
      nom: "Nord",
      codeInsee: "59",
    },
    localisation: {
      centre: {
        coordinates: [3.0931, 50.6034],
        type: "Point",
      },
      bbox: {
        coordinates: [
          [
            [3.071295, 50.588712],
            [3.114835, 50.588712],
            [3.114835, 50.617994],
            [3.071295, 50.617994],
            [3.071295, 50.588712],
          ],
        ],
        type: "Polygon",
      },
    },
    mission_locale: {
      id: 191,
      nom: "IMPULSIONS METROPOLE SUD",
      siret: "40300668700020",
      localisation: {
        geopoint: {
          type: "Point",
          coordinates: [3.0905368, 50.6095445],
        },
        adresse: "202 bis rue Louis Braille",
        cp: "59790",
        ville: "RONCHIN",
      },
      contact: {
        email: "contact@exemple.fr",
        telephone: "03 00 00 00 00",
        siteWeb: "http://missionlocale-metropolesud.fr/",
      },
    },
    nom: "Ronchin",
    region: {
      codeInsee: "32",
      nom: "Hauts-de-France",
    },
    arrondissements: [],
    anciennes: [],
    updated_at: new Date("2024-12-18"),
  },
  {
    _id: new ObjectId(),
    code: {
      insee: "22362",
      postaux: ["22220"],
    },
    academie: {
      nom: "Rennes",
      id: "A14",
      code: "14",
    },
    created_at: new Date("2024-11-28"),
    departement: {
      nom: "Côtes-d'Armor",
      codeInsee: "22",
    },
    localisation: {
      centre: {
        coordinates: [-3.2331, 48.7846],
        type: "Point",
      },
      bbox: {
        coordinates: [
          [
            [-3.244595, 48.777193],
            [-3.221604, 48.777193],
            [-3.221604, 48.792055],
            [-3.244595, 48.792055],
            [-3.244595, 48.777193],
          ],
        ],
        type: "Polygon",
      },
    },
    mission_locale: {
      id: 256,
      nom: "OUEST COTES D'ARMOR",
      siret: "32678184600042",
      localisation: {
        geopoint: {
          type: "Point",
          coordinates: [-3.459144, 48.732084],
        },
        adresse: "MDEFP - 1 rue du Muguet",
        cp: "22301",
        ville: "LANNION CEDEX",
      },
      contact: {
        email: "lannion@exemple.fr",
        telephone: "02 00 00 00 00",
        siteWeb: "https://www.ajoca.fr",
      },
    },
    nom: "Tréguier",
    region: {
      codeInsee: "53",
      nom: "Bretagne",
    },
    arrondissements: [],
    anciennes: [],
    updated_at: new Date("2024-12-18"),
  },
  {
    _id: new ObjectId(),
    code: {
      insee: "59350",
      postaux: ["59000", "59160", "59260", "59777", "59800"],
    },
    academie: {
      nom: "Lille",
      id: "A09",
      code: "09",
    },
    created_at: new Date("2024-11-28T15:47:27.885Z"),
    departement: {
      nom: "Nord",
      codeInsee: "59",
    },
    localisation: {
      centre: {
        coordinates: [3.0468, 50.6311],
        type: "Point",
      },
      bbox: {
        coordinates: [
          [
            [2.967992, 50.6009],
            [3.125688, 50.6009],
            [3.125688, 50.661262],
            [2.967992, 50.661262],
            [2.967992, 50.6009],
          ],
        ],
        type: "Polygon",
      },
    },
    mission_locale: null,
    nom: "Lille",
    region: {
      codeInsee: "32",
      nom: "Hauts-de-France",
    },
    arrondissements: [],
    anciennes: [],
    updated_at: new Date("2024-12-18T12:23:53.852Z"),
  },
];

export const expectedOrganismes: IOrganisme[] = [
  {
    contacts: [
      {
        email: "contact@mail.com",
        confirmation_referentiel: true,
        sources: ["source1", "source2"],
      },
      {
        email: "notConfirmed@mail.com",
        confirmation_referentiel: false,
        sources: [],
      },
    ],
    identifiant: {
      siret: "13002975400020",
      uai: "0597114M",
    },
    etablissement: {
      adresse: {
        academie: {
          code: "09",
          id: "A09",
          nom: "Lille",
        },
        code_postal: "59790",
        commune: {
          code_insee: "59507",
          nom: "Ronchin",
        },
        departement: {
          code_insee: "59",
          nom: "Nord",
        },
        label: "9 RUE DE L'UNIVERSITE",
        region: {
          code_insee: "32",
          nom: "Hauts-de-France",
        },
      },
      creation: new Date("1970-01-19T23:49:51.600Z"),
      enseigne: "FACULTE SCIENCES SPORT ET EDUCATION PHYSIQUE",
      fermeture: null,
      ouvert: true,
      siret: "13002975400020",
    },
    renseignements_specifiques: {
      numero_activite: "32591104359",
      qualiopi: true,
    },
    statut: {
      referentiel: "présent",
    },
    unite_legale: {
      actif: true,
      cessation: null,
      creation: new Date("1970-01-19T21:24:21.600Z"),
      raison_sociale: "UNIVERSITE DE LILLE",
      siren: "130029754",
    },
  },
  {
    contacts: [],
    identifiant: {
      siret: "26220009000278",
      uai: "0932751K",
    },
    etablissement: {
      adresse: {
        academie: {
          code: "14",
          id: "A14",
          nom: "Rennes",
        },
        code_postal: "22220",
        commune: {
          code_insee: "22362",
          nom: "Tréguier",
        },
        departement: {
          code_insee: "22",
          nom: "Côtes-d'Armor",
        },
        label: "TOUR SAINT MICHEL",
        region: {
          code_insee: "53",
          nom: "Bretagne",
        },
      },
      creation: new Date("1970-01-20T17:21:03.600Z"),
      enseigne: "ECOLE D'AIDE SOIGNANTS",
      fermeture: null,
      ouvert: true,
      siret: "26220009000278",
    },
    renseignements_specifiques: {
      numero_activite: null,
      qualiopi: false,
    },
    statut: {
      referentiel: "présent",
    },
    unite_legale: {
      actif: true,
      cessation: null,
      creation: new Date("1969-12-06T19:09:06.639Z"),
      raison_sociale: "CENTRE HOSPITALIER DE SAINT-BRIEUC, PAIMPOL ET TREGUIER",
      siren: "262200090",
    },
  },
];
