import { useMongo } from "@tests/mongo.test.utils.js";
import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchAcademies } from "@/services/apis/enseignementSup/enseignementSup.js";
import type { ISourceGeoCommune, ISourceGeoDepartement, ISourceGeoRegion } from "@/services/apis/geo/geo.js";
import { fetchGeoCommunes, fetchGeoDepartements, fetchGeoRegions } from "@/services/apis/geo/geo.js";
import type { IInseeCollectiviteOutreMer } from "@/services/apis/insee/insee.js";
import { fetchCollectivitesOutreMer } from "@/services/apis/insee/insee.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { runCommuneImporter } from "./commune.importer.js";

useMongo();

vi.mock("@/services/apis/geo/geo.js");
vi.mock("@/services/apis/enseignementSup/enseignementSup.js");
vi.mock("@/services/apis/insee/insee.js");

const sourceRegions: ISourceGeoRegion[] = [
  {
    nom: "Île-de-France",
    code: "11",
  },
  {
    nom: "Centre-Val de Loire",
    code: "24",
  },
];

const sourceCollectivites: IInseeCollectiviteOutreMer[] = [
  {
    code: "975",
    intitule: "Saint-Pierre-et-Miquelon",
  },
];

const sourceDepartements: Record<ISourceGeoRegion["code"], ISourceGeoDepartement[]> = {
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
};

const sourceCommunes: Record<ISourceGeoDepartement["code"], ISourceGeoCommune[]> = {
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
      codeDepartement: "988",
      codeRegion: "988",
      nom: "Belep",
    },
  ],
};

const sourceAcademies = [
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
];

describe("runCommuneImporter", () => {
  const now = new Date("2024-10-03T21:53:08.141Z");
  const yesterday = new Date("2024-10-02T21:53:08.141Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    return () => vi.useRealTimers();
  });

  it("should import initial communes", async () => {
    vi.mocked(fetchGeoRegions).mockResolvedValue(sourceRegions);
    vi.mocked(fetchGeoDepartements).mockImplementation(async (codeRegion: string) => sourceDepartements[codeRegion]);
    vi.mocked(fetchGeoCommunes).mockImplementation(async (codeDepartement: string) => sourceCommunes[codeDepartement]);
    vi.mocked(fetchCollectivitesOutreMer).mockResolvedValue(sourceCollectivites);
    vi.mocked(fetchAcademies).mockResolvedValue(sourceAcademies);

    await runCommuneImporter();

    expect(fetchGeoRegions).toHaveBeenCalledTimes(1);
    expect(fetchGeoDepartements).toHaveBeenCalledTimes(3);
    expect(fetchGeoCommunes).toHaveBeenCalledTimes(6);

    const communes = await getDbCollection("commune").find({}).toArray();

    expect(
      communes.map(({ _id, ...rest }) => rest).toSorted((a, b) => a.codeInsee.localeCompare(b.codeInsee))
    ).toMatchSnapshot();

    const importMetas = await getDbCollection("import.meta").find().toArray();

    expect(importMetas).toEqual([
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "communes",
        status: "done",
      },
    ]);
  });

  it("should import communes with existing regions and departements", async () => {
    await getDbCollection("commune").insertMany(
      sourceCommunes["75"].map((geoCommune) => ({
        _id: new ObjectId(),
        nom: "Ancien nom",
        codeInsee: geoCommune.code,
        codesPostaux: geoCommune.codesPostaux,
        departement: {
          nom: "Ancien nom departement",
          codeInsee: "Ancien code departement",
          region: {
            codeInsee: "Ancien code region",
            nom: "Ancien nom region",
          },
          academie: {
            code: "Ancien code",
            nom: "Ancien nom",
            id: "Ancien id",
          },
        },
        centre: { type: "Point", coordinates: [0, 0] },
        bbox: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [0, 0],
              [0, 0],
              [0, 0],
              [0, 0],
            ],
          ],
        },
        updated_at: yesterday,
        created_at: yesterday,
      }))
    );
    await getDbCollection("commune").insertOne({
      _id: new ObjectId(),
      nom: "Ancien nom",
      codeInsee: "Code supprimé",
      codesPostaux: [],
      departement: {
        nom: "Ancien nom departement",
        codeInsee: "Ancien code departement",
        region: {
          codeInsee: "Ancien code region",
          nom: "Ancien nom region",
        },
        academie: {
          code: "Ancien code",
          nom: "Ancien nom",
          id: "Ancien id",
        },
      },
      centre: { type: "Point", coordinates: [0, 0] },
      bbox: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
          ],
        ],
      },
      updated_at: yesterday,
      created_at: yesterday,
    });
    await getDbCollection("import.meta").insertOne({
      _id: new ObjectId(),
      import_date: yesterday,
      type: "communes",
      status: "done",
    });

    vi.mocked(fetchGeoRegions).mockResolvedValue(sourceRegions);
    vi.mocked(fetchGeoDepartements).mockImplementation(async (codeRegion: string) => sourceDepartements[codeRegion]);
    vi.mocked(fetchGeoCommunes).mockImplementation(async (codeDepartement: string) => sourceCommunes[codeDepartement]);
    vi.mocked(fetchAcademies).mockResolvedValue(sourceAcademies);

    await runCommuneImporter();

    expect(fetchGeoRegions).toHaveBeenCalledTimes(1);
    expect(fetchGeoDepartements).toHaveBeenCalledTimes(3);
    expect(fetchGeoCommunes).toHaveBeenCalledTimes(6);

    const communes = await getDbCollection("commune").find({}).toArray();

    expect(
      communes.map(({ _id, ...rest }) => rest).toSorted((a, b) => a.codeInsee.localeCompare(b.codeInsee))
    ).toMatchSnapshot();

    const importMetas = await getDbCollection("import.meta").find().toArray();

    expect(importMetas).toEqual([
      {
        _id: expect.any(ObjectId),
        import_date: yesterday,
        type: "communes",
        status: "done",
      },
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "communes",
        status: "done",
      },
    ]);
  });
});
