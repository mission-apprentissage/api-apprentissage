import nock from "nock";
import { describe, expect, it } from "vitest";

import { fetchGeoCommunes, fetchGeoDepartements, fetchGeoRegions } from "./geo.js";

describe("fetchGeoRegions", () => {
  it("should return the list of regions", async () => {
    const regions = [
      {
        nom: "Île-de-France",
        code: "11",
      },
      {
        nom: "Centre-Val de Loire",
        code: "24",
      },
    ];

    nock("https://geo.api.gouv.fr").get("/regions").reply(200, regions);

    const result = await fetchGeoRegions();

    expect(result).toEqual(regions);
  });
});

describe("fetchGeoDepartements", () => {
  it("should return the list of departements of the region", async () => {
    const departements = [
      {
        nom: "Calvados",
        code: "14",
        codeRegion: "28",
      },
      {
        nom: "Eure",
        code: "27",
        codeRegion: "28",
      },
      {
        nom: "Manche",
        code: "50",
        codeRegion: "28",
      },
      {
        nom: "Orne",
        code: "61",
        codeRegion: "28",
      },
      {
        nom: "Seine-Maritime",
        code: "76",
        codeRegion: "28",
      },
    ];

    nock("https://geo.api.gouv.fr").get("/regions/28/departements").reply(200, departements);

    const result = await fetchGeoDepartements("28");

    expect(result).toEqual(departements);
  });
});

describe("fetchGeoCommunes", () => {
  it("should return the list of departements of the departement", async () => {
    const communes = [
      {
        code: "01001",
        codesPostaux: ["01400"],
        centre: {
          type: "Point",
          coordinates: [4.9306, 46.1517],
        },
        bbox: {
          type: "Polygon",
          coordinates: [
            [
              [4.902789, 46.119597],
              [4.958412, 46.119597],
              [4.958412, 46.183807],
              [4.902789, 46.183807],
              [4.902789, 46.119597],
            ],
          ],
        },
        codeDepartement: "01",
        codeRegion: "84",
        nom: "L'Abergement-Clémenciat",
      },
      {
        code: "01002",
        codesPostaux: ["01640"],
        centre: {
          type: "Point",
          coordinates: [5.4247, 46.0071],
        },
        bbox: {
          type: "Polygon",
          coordinates: [
            [
              [5.40437, 45.982775],
              [5.44498, 45.982775],
              [5.44498, 46.031487],
              [5.40437, 46.031487],
              [5.40437, 45.982775],
            ],
          ],
        },
        codeDepartement: "01",
        codeRegion: "84",
        nom: "L'Abergement-de-Varey",
      },
      {
        code: "01004",
        codesPostaux: ["01500"],
        centre: {
          type: "Point",
          coordinates: [5.3706, 45.9575],
        },
        bbox: {
          type: "Polygon",
          coordinates: [
            [
              [5.327362, 45.931055],
              [5.413775, 45.931055],
              [5.413775, 45.983886],
              [5.327362, 45.983886],
              [5.327362, 45.931055],
            ],
          ],
        },
        codeDepartement: "01",
        codeRegion: "84",
        nom: "Ambérieu-en-Bugey",
      },
    ];

    nock("https://geo.api.gouv.fr")
      .get("/departements/01/communes")
      .query({ fields: "code,codesPostaux,centre,bbox,codeDepartement,codeRegion", geometry: "centre" })
      .reply(200, communes);

    const result = await fetchGeoCommunes("01");

    expect(result).toEqual(communes);
  });
});
