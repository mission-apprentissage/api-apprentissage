import nock from "nock";
import { describe, expect, it } from "vitest";

import { fetchCollectivitesOutreMer, fetchCommuneOutreMer } from "./insee.js";

describe("fetchCollectivitesOutreMer", () => {
  it("should return the list of collectivités d'outre-mer", async () => {
    const collectivites = [
      {
        code: "975",
        intitule: "Saint-Pierre-et-Miquelon",
      },
      {
        code: "977",
        intitule: "Saint-Barthélemy",
      },
      {
        code: "978",
        intitule: "Saint-Martin",
      },
      {
        code: "984",
        intitule: "Terres australes et antarctiques françaises",
      },
      {
        code: "986",
        intitule: "Wallis-et-Futuna",
      },
      {
        code: "987",
        intitule: "Polynésie française",
      },
      {
        code: "988",
        intitule: "Nouvelle-Calédonie",
      },
      {
        code: "989",
        intitule: "La Passion-Clipperton",
      },
    ];

    nock("https://api.insee.fr")
      .get("/metadonnees/V1/geo/collectivitesDOutreMer")
      .matchHeader("Authorization", "Bearer token")
      .reply(200, collectivites);

    const result = await fetchCollectivitesOutreMer();

    expect(result).toEqual(collectivites);
  });
});

describe("fetchCommuneOutreMer", () => {
  it("should return the list of communes of the collectivite", async () => {
    const communes = [
      {
        code: "98801",
        intitule: "Belep",
      },
      {
        code: "98802",
        intitule: "Bouloupari",
      },
      {
        code: "98803",
        intitule: "Bourail",
      },
      {
        code: "98804",
        intitule: "Canala",
      },
    ];

    nock("https://api.insee.fr")
      .get("/metadonnees/V1/geo/collectivitesDOutreMer/988/descendants")
      .query({ type: "commune" })
      .reply(200, communes);

    const result = await fetchCommuneOutreMer("988");

    expect(result).toEqual(communes);
  });
});
