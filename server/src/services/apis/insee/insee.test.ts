import nock from "nock";
import { describe, expect, it } from "vitest";

import {
  fetchAnciennesCommuneByCodeCommune,
  fetchArrondissementIndexedByCodeCommune,
  fetchCollectivitesOutreMer,
  fetchCommuneOutreMer,
} from "./insee.js";

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
      .get("/metadonnees/geo/collectivitesDOutreMer")
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
      .get("/metadonnees/geo/collectivitesDOutreMer/988/descendants")
      .query({ type: "commune" })
      .reply(200, communes);

    const result = await fetchCommuneOutreMer("988");

    expect(result).toEqual(communes);
  });
});

describe("fetchArrondissementIndexedByCodeCommune", () => {
  it("should return the list of arrondissements indexed by code commune", async () => {
    const scope = nock("https://api.insee.fr");

    const arrondissements = [
      {
        code: "75101",
        intitule: "1er arrondissement",
      },
      {
        code: "75102",
        intitule: "2e arrondissement",
      },
      {
        code: "13205",
        intitule: "Marseille 5e Arrondissement",
      },
    ];

    scope.get("/metadonnees/geo/arrondissementsMunicipaux").reply(200, arrondissements);
    scope
      .get("/metadonnees/geo/arrondissementMunicipal/75101/ascendants")
      .query({ type: "Commune" })
      .reply(200, [{ code: "75056" }]);
    scope
      .get("/metadonnees/geo/arrondissementMunicipal/75102/ascendants")
      .query({ type: "Commune" })
      .reply(200, [{ code: "75056" }]);
    scope
      .get("/metadonnees/geo/arrondissementMunicipal/13205/ascendants")
      .query({ type: "Commune" })
      .reply(200, [{ code: "13055" }]);

    const result = await fetchArrondissementIndexedByCodeCommune();
    expect(result).toEqual({
      "75056": [arrondissements[0], arrondissements[1]],
      "13055": [arrondissements[2]],
    });

    expect(scope.isDone()).toBe(true);
  });

  describe("fetchAnciennesCommuneByCodeCommune", () => {
    it("should return the list of anciennes communes indexed by code commune", async () => {
      const deleguees = [
        {
          code: "77351",
          intitule: "Ozouer-le-Repos",
        },
        {
          code: "77170",
          intitule: "Épisy",
        },
        {
          code: "77299",
          intitule: "Montarlot",
        },
      ];

      const associees = [
        { code: "77316", intitule: "Moret-sur-Loing" },
        { code: "77491", intitule: "Veneux-les-Sablons" },
        { code: "77399", intitule: "Saint-Ange-le-Viel" },
      ];

      const scope = nock("https://api.insee.fr");
      scope.get("/metadonnees/geo/communesDeleguees").reply(200, deleguees);
      scope.get("/metadonnees/geo/communesAssociees").reply(200, associees);
      scope
        .get("/metadonnees/geo/communeDeleguee/77351/ascendants")
        .query({ type: "Commune" })
        .reply(200, [{ code: "77010" }]);

      scope
        .get("/metadonnees/geo/communeDeleguee/77170/ascendants")
        .query({ type: "Commune" })
        .reply(200, [{ code: "77316" }]);
      scope
        .get("/metadonnees/geo/communeDeleguee/77299/ascendants")
        .query({ type: "Commune" })
        .reply(200, [{ code: "77316" }]);
      scope
        .get("/metadonnees/geo/communeAssociee/77316/ascendants")
        .query({ type: "Commune" })
        .reply(200, [{ code: "77316" }]);
      scope
        .get("/metadonnees/geo/communeAssociee/77491/ascendants")
        .query({ type: "Commune" })
        .reply(200, [{ code: "77316" }]);
      scope
        .get("/metadonnees/geo/communeAssociee/77399/ascendants")
        .query({ type: "Commune" })
        .reply(200, [{ code: "77504" }]);

      const result = await fetchAnciennesCommuneByCodeCommune();
      expect(result).toEqual({
        "77010": [deleguees[0]],
        "77316": [associees[0], associees[1], deleguees[1], deleguees[2]],
        "77504": [associees[2]],
      });

      expect(scope.isDone()).toBe(true);
    });
  });
});
