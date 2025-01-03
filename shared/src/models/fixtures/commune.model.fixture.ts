import { ObjectId } from "bson";

import type { ISourceGeoCommune, ISourceGeoDepartement, ISourceGeoRegion } from "../../apis/geo_gouv.js";
import type { IInseeItem } from "../../apis/insee.js";
import type { ISourceMissionLocale, ISourceUnmlPayload } from "../../apis/unml.js";
import { zSourceMissionLocale } from "../../apis/unml.js";
import type { ICommuneInternal } from "../commune.model.js";

export const sourceRegionsFixtures: ISourceGeoRegion[] = [
  {
    nom: "Île-de-France",
    code: "11",
  },
  {
    nom: "Centre-Val de Loire",
    code: "24",
  },
];

export const sourceRegionExtendedFixtures: ISourceGeoRegion[] = [
  { nom: "Saint-Pierre-et-Miquelon", code: "975" },
  { nom: "Île de Clipperton", code: "989" },
];

export const inseeCollectiviteFixtures: IInseeItem[] = [
  {
    code: "975",
    intitule: "Saint-Pierre-et-Miquelon",
  },
  {
    code: "989",
    intitule: "La Passion-Clipperton",
  },
];

export const inseeArrondissementFixtures: Record<string, IInseeItem[]> = {
  "75056": [
    { code: "75101", intitule: "Paris 1er Arrondissement" },
    { code: "75120", intitule: "Paris 20e Arrondissement" },
  ],
};

export const inseeAnciennesFixtures: Record<string, IInseeItem[]> = {
  "77002": [
    { code: "77166", intitule: "Écuelles" },
    { code: "77170", intitule: "Épisy" },
  ],
};

export const sourceDepartementFixtures = {
  "11": [
    {
      nom: "Paris",
      code: "75",
      codeRegion: "11",
    },
    {
      nom: "Seine-et-Marne",
      code: "77",
      codeRegion: "11",
    },
  ],
  "24": [
    {
      nom: "Cher",
      code: "18",
      codeRegion: "24",
    },
    {
      nom: "Loir-et-Cher",
      code: "41",
      codeRegion: "24",
    },
    {
      nom: "Loiret",
      code: "45",
      codeRegion: "24",
    },
  ],
  "975": [
    {
      nom: "Saint-Pierre-et-Miquelon",
      code: "975",
      codeRegion: "975",
    },
  ],
  "989": [
    {
      nom: "Île de Clipperton",
      code: "989",
      codeRegion: "989",
    },
  ],
} as const satisfies Record<ISourceGeoRegion["code"], ISourceGeoDepartement[]>;

export const missionLocaleFixtures = {
  226: {
    id: 226,
    code: "eLysTFgBLyPbR4gevAabK827X7R4GVm5",
    numAdherent: 609,
    structureStatutId: 1,
    structureTypeId: 2,
    nomStructure: "DE PARIS",
    porteusePLIE: false,
    porteuseMDE: false,
    porteuseML: true,
    effectif: "244,94",
    effectifETP: "235.34",
    adresse1: "22 rue Pajol",
    adresse2: "",
    cp: "75018",
    ville: "PARIS",
    telephones: "0179970000",
    fax: "01 75 00 00 00",
    siret: "53132862300149",
    siteWeb: "https://www.missionlocale.paris/",
    emailAccueil: "contact@mail.fr",
    geoloc_lng: "2.3740736",
    geoloc_lat: "48.8848179",
    linkedin: "",
    twitter: "",
    reseau: true,
    anneeAdhesion: 2024,
    annuaire: false,
    facebook: "",
    codeDepartement: "75",
    codeRegion: "11",
    dateModification: 1665562343,
    nbAntennes: 6,
    codeStructure: "75119",
    serviceCivique: false,
    isPartenaire: false,
    label: false,
    labelDate: 0,
    typologie: "",
    structureTypeLibelle: "MISSION LOCALE",
    structureStatutLibelle: "ASSOCIATION LOI 1901",
    nomDepartement: "Paris",
    nomRegion: "Île-de-France",
    alias: "PARIS",
  },
  374: {
    id: 374,
    code: "6rTzDpdW96UFP3M3tWFKxHm6RZvAXnzU",
    numAdherent: 374,
    structureStatutId: 1,
    structureTypeId: 2,
    nomStructure: "DE LA SEINE ET DU LOING",
    porteusePLIE: false,
    porteuseMDE: false,
    porteuseML: false,
    effectif: "16",
    effectifETP: "15.8",
    adresse1: "17 Rue des Tanneurs",
    adresse2: "",
    cp: "77140",
    ville: "NEMOURS",
    telephones: "01 64 28 51 58",
    fax: "01 64 29 83 19",
    siret: "44270199100014",
    siteWeb: "https://www.mlseineetloing.fr/",
    emailAccueil: "",
    geoloc_lng: "2.6988983",
    geoloc_lat: "48.2655271",
    linkedin: "",
    twitter: "",
    reseau: true,
    anneeAdhesion: 2024,
    annuaire: true,
    facebook: "",
    codeDepartement: "77",
    codeRegion: "11",
    dateModification: 1665562342,
    nbAntennes: 0,
    codeStructure: "77333",
    serviceCivique: false,
    isPartenaire: false,
    label: false,
    labelDate: 0,
    typologie: "",
    structureTypeLibelle: "MISSION LOCALE",
    structureStatutLibelle: "ASSOCIATION LOI 1901",
    nomDepartement: "Seine-et-Marne",
    nomRegion: "Île-de-France",
    alias: "NEMOURS",
  },
} as const satisfies Record<number, ISourceUnmlPayload["results"][0]["structure"]>;

export const sourceUnmlResultsFixtures = {
  "75": {
    results: [
      "75001",
      "75002",
      "75003",
      "75004",
      "75005",
      "75006",
      "75007",
      "75008",
      "75009",
      "75010",
      "75011",
      "75012",
      "75013",
      "75014",
      "75015",
      "75016",
      "75017",
      "75018",
      "75019",
      "75020",
    ].map((cp, i) => ({
      id: 34396 + i,
      structureId: 226,
      codePostal: cp,
      ville: "PARIS",
      structure: missionLocaleFixtures[226],
    })),
    total: 20,
    success: true,
  },
  "77": {
    results: [
      {
        id: 34749,
        structureId: 374,
        codePostal: "77760",
        ville: "ACHERES LA FORET",
        structure: missionLocaleFixtures[374],
      },
      {
        id: 34750,
        structureId: 374,
        codePostal: "77760",
        ville: "AMPONVILLE",
        structure: missionLocaleFixtures[374],
      },
    ],
    total: 2,
    success: true,
  },
  "18": {
    results: [],
    total: 0,
    success: true,
  },
  "41": {
    results: [],
    total: 0,
    success: true,
  },
  "45": {
    results: [],
    total: 0,
    success: true,
  },
  "975": {
    results: [],
    total: 0,
    success: true,
  },
  "989": {
    results: [],
    total: 0,
    success: true,
  },
} as const satisfies Record<ISourceGeoDepartement["code"], ISourceUnmlPayload>;

export const sourceCommuneFixtures = {
  "75": [
    {
      code: "75056",
      codesPostaux: [
        "75001",
        "75002",
        "75003",
        "75004",
        "75005",
        "75006",
        "75007",
        "75008",
        "75009",
        "75010",
        "75011",
        "75012",
        "75013",
        "75014",
        "75015",
        "75016",
        "75017",
        "75018",
        "75019",
        "75020",
        "75116",
      ],
      centre: {
        type: "Point",
        coordinates: [2.347, 48.8589],
      },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [2.224219, 48.815562],
            [2.469851, 48.815562],
            [2.469851, 48.902148],
            [2.224219, 48.902148],
            [2.224219, 48.815562],
          ],
        ],
      },
      codeDepartement: "75",
      codeRegion: "11",
      nom: "Paris",
    },
  ],
  "77": [
    {
      code: "77001",
      codesPostaux: ["77760"],
      centre: {
        type: "Point",
        coordinates: [2.5653, 48.3476],
      },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [2.541179, 48.323765],
            [2.589357, 48.323765],
            [2.589357, 48.371343],
            [2.541179, 48.371343],
            [2.541179, 48.323765],
          ],
        ],
      },
      codeDepartement: "77",
      codeRegion: "11",
      nom: "Achères-la-Forêt",
    },
    {
      code: "77002",
      codesPostaux: ["77120"],
      centre: {
        type: "Point",
        coordinates: [3.14, 48.7327],
      },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [3.106556, 48.702079],
            [3.173488, 48.702079],
            [3.173488, 48.763362],
            [3.106556, 48.763362],
            [3.106556, 48.702079],
          ],
        ],
      },
      codeDepartement: "77",
      codeRegion: "11",
      nom: "Amillis",
    },
  ],
  "18": [
    {
      code: "18001",
      codesPostaux: ["18250"],
      centre: {
        type: "Point",
        coordinates: [2.4601, 47.2828],
      },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [2.437874, 47.25828],
            [2.482241, 47.25828],
            [2.482241, 47.307371],
            [2.437874, 47.307371],
            [2.437874, 47.25828],
          ],
        ],
      },
      codeDepartement: "18",
      codeRegion: "24",
      nom: "Achères",
    },
    {
      code: "18002",
      codesPostaux: ["18200"],
      centre: {
        type: "Point",
        coordinates: [2.5413, 46.6573],
      },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [2.510546, 46.625569],
            [2.572084, 46.625569],
            [2.572084, 46.689055],
            [2.510546, 46.689055],
            [2.510546, 46.625569],
          ],
        ],
      },
      codeDepartement: "18",
      codeRegion: "24",
      nom: "Ainay-le-Vieil",
    },
  ],
  "41": [
    {
      code: "41001",
      codesPostaux: ["41310"],
      centre: {
        type: "Point",
        coordinates: [0.9704, 47.7094],
      },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [0.940639, 47.683749],
            [1.000203, 47.683749],
            [1.000203, 47.735078],
            [0.940639, 47.735078],
            [0.940639, 47.683749],
          ],
        ],
      },
      codeDepartement: "41",
      codeRegion: "24",
      nom: "Ambloy",
    },
  ],
  "45": [
    {
      code: "45001",
      codesPostaux: ["45230"],
      centre: {
        type: "Point",
        coordinates: [2.7925, 47.7587],
      },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [2.749006, 47.727449],
            [2.835944, 47.727449],
            [2.835944, 47.790032],
            [2.749006, 47.790032],
            [2.749006, 47.727449],
          ],
        ],
      },
      codeDepartement: "45",
      codeRegion: "24",
      nom: "Adon",
    },
  ],
  "975": [
    {
      code: "98801",
      codesPostaux: ["98811"],
      centre: {
        type: "Point",
        coordinates: [163.6412, -19.711],
      },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [163.569697, -19.902093],
            [163.708819, -19.902093],
            [163.708819, -19.525114],
            [163.569697, -19.525114],
            [163.569697, -19.902093],
          ],
        ],
      },
      codeDepartement: "975",
      codeRegion: "975",
      nom: "Belep",
    },
  ],
  "989": [
    {
      code: "98901",
      codesPostaux: ["98799"],
      centre: { type: "Point", coordinates: [-109.2172, 10.3034] },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [-109.234607, 10.287154],
            [-109.19979, 10.287154],
            [-109.19979, 10.31957],
            [-109.234607, 10.31957],
            [-109.234607, 10.287154],
          ],
        ],
      },
      codeDepartement: "989",
      codeRegion: "989",
      nom: "Île de Clipperton",
    },
  ],
} as const satisfies Record<ISourceGeoDepartement["code"], ISourceGeoCommune[]>;

export const academieFixtures = [
  {
    dep_code: "75",
    aca_nom: "Paris",
    aca_id: "A01",
    aca_code: "01",
  },
  {
    dep_code: "77",
    aca_nom: "Créteil",
    aca_id: "A24",
    aca_code: "24",
  },
  {
    dep_code: "18",
    aca_nom: "Orléans-Tours",
    aca_id: "A18",
    aca_code: "18",
  },
  {
    dep_code: "41",
    aca_nom: "Orléans-Tours",
    aca_id: "A18",
    aca_code: "18",
  },
  {
    dep_code: "45",
    aca_nom: "Orléans-Tours",
    aca_id: "A18",
    aca_code: "18",
  },
  {
    dep_code: "975",
    aca_nom: "Saint-Pierre-et-Miquelon",
    aca_id: "A44",
    aca_code: "44",
  },
  {
    aca_code: "41",
    aca_nom: "Polynésie Française",
    aca_id: "A41",
    dep_code: "989",
    dep_nom: "Île de Clipperton",
  },
];

export function getMissionLocaleFixtureFromSource(sourceMl: ISourceMissionLocale): ICommuneInternal["mission_locale"] {
  const data = zSourceMissionLocale.parse(sourceMl);
  return {
    id: data.id,
    nom: data.nomStructure,
    siret: data.siret,
    localisation: {
      geopoint:
        data.geoloc_lng === null || data.geoloc_lat === null
          ? null
          : {
              type: "Point",
              coordinates: [parseFloat(data.geoloc_lng), parseFloat(data.geoloc_lat)],
            },
      adresse: sourceMl.adresse1,
      cp: data.cp,
      ville: data.ville,
    },
    contact: {
      email: data.emailAccueil,
      telephone: data.telephones,
      siteWeb: data.siteWeb,
    },
  };
}

export const communeFixtures: ICommuneInternal[] = Object.values(sourceCommuneFixtures)
  .flat()
  .map((sourceCommune) => {
    const academie = academieFixtures.find((aca) => aca.dep_code === sourceCommune.codeDepartement)!;
    const dep = sourceDepartementFixtures[sourceCommune.codeRegion].find(
      (dep) => dep.code === sourceCommune.codeDepartement
    );
    const reg =
      sourceRegionsFixtures.find((reg) => reg.code === sourceCommune.codeRegion)?.nom ??
      inseeCollectiviteFixtures.find((coll) => coll.code === sourceCommune.codeRegion)?.intitule;

    if (!reg) {
      throw new Error(`Region not found for commune ${sourceCommune.nom}`);
    }

    if (!dep) {
      throw new Error(`Departement not found for commune ${sourceCommune.nom}`);
    }

    const mlParCp = sourceUnmlResultsFixtures[sourceCommune.codeDepartement].results.find(
      (r) => r.codePostal === sourceCommune.codesPostaux[0]
    );

    return {
      _id: new ObjectId(),
      nom: sourceCommune.nom,
      code: { insee: sourceCommune.code, postaux: sourceCommune.codesPostaux },
      departement: {
        nom: dep.nom,
        codeInsee: sourceCommune.codeDepartement,
      },
      region: {
        nom: reg,
        codeInsee: sourceCommune.codeRegion,
      },
      academie: {
        nom: academie.aca_nom,
        code: academie.aca_code,
        id: academie.aca_id,
      },
      localisation: {
        centre: sourceCommune.centre,
        bbox: sourceCommune.bbox,
      },
      mission_locale: mlParCp == null ? null : getMissionLocaleFixtureFromSource(mlParCp.structure),
      arrondissements:
        inseeArrondissementFixtures[sourceCommune.code]?.map((item) => ({
          code: item.code,
          nom: item.intitule,
        })) ?? [],
      anciennes:
        inseeAnciennesFixtures[sourceCommune.code]?.map((item) => ({
          codeInsee: item.code,
          nom: item.intitule,
        })) ?? [],
      updated_at: new Date(),
      created_at: new Date(),
    };
  });
