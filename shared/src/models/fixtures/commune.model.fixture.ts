import { ObjectId } from "bson";

import type { ISourceGeoCommune, ISourceGeoDepartement, ISourceGeoRegion } from "../../apis/geo_gouv.js";
import type { IInseeCollectiviteOutreMer } from "../../apis/insee.js";
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

export const inseeCollectiviteFixtures: IInseeCollectiviteOutreMer[] = [
  {
    code: "975",
    intitule: "Saint-Pierre-et-Miquelon",
  },
  {
    code: "989",
    intitule: "La Passion-Clipperton",
  },
];

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
      updated_at: new Date(),
      created_at: new Date(),
    };
  });
