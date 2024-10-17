import nock from "nock";
import { describe, expect, it } from "vitest";

import { fetchAcademies } from "./enseignementSup.js";

describe("fetchEnseignementSup", () => {
  it("should return the list of academie grouped by Departement", async () => {
    const data = [
      {
        dep_code: "01",
        aca_nom: "Lyon",
        aca_id: "A10",
        aca_code: "10",
      },
      {
        dep_code: "02",
        aca_nom: "Amiens",
        aca_id: "A20",
        aca_code: "20",
      },
      {
        dep_code: "03",
        aca_nom: "Clermont-Ferrand",
        aca_id: "A06",
        aca_code: "06",
      },
      {
        dep_code: "04",
        aca_nom: "Aix-Marseille",
        aca_id: "A02",
        aca_code: "02",
      },
      {
        dep_code: "05",
        aca_nom: "Aix-Marseille",
        aca_id: "A02",
        aca_code: "02",
      },
      {
        aca_code: "32",
        aca_nom: "Guadeloupe",
        aca_id: "A32",
        dep_code: "971",
      },
    ];

    nock("https://data.enseignementsup-recherche.gouv.fr")
      .get("/api/explore/v2.1/catalog/datasets/fr-esr-referentiel-geographique/exports/json")
      .query({ group_by: "dep_code,aca_nom,aca_id,aca_code" })
      //   .query(true)
      .reply(200, data, {
        "content-type": "application/json",
        "content-disposition": 'attachment; filename="fr-esr-referentiel-geographique.json"',
      });

    const result = await fetchAcademies();

    expect(result).toEqual(data);
  });

  it("should fix Saint-Martin & Saint-Barthélémy academies", async () => {
    const commonData = [
      {
        dep_code: "01",
        aca_nom: "Lyon",
        aca_id: "A10",
        aca_code: "10",
      },
      {
        dep_code: "02",
        aca_nom: "Amiens",
        aca_id: "A20",
        aca_code: "20",
      },
      {
        dep_code: "03",
        aca_nom: "Clermont-Ferrand",
        aca_id: "A06",
        aca_code: "06",
      },
      {
        dep_code: "04",
        aca_nom: "Aix-Marseille",
        aca_id: "A02",
        aca_code: "02",
      },
      {
        dep_code: "05",
        aca_nom: "Aix-Marseille",
        aca_id: "A02",
        aca_code: "02",
      },
      {
        aca_code: "00",
        aca_nom: "Étranger",
        aca_id: "A00",
        dep_code: "984",
      },
      {
        aca_code: "40",
        aca_nom: "Nouvelle-Calédonie",
        aca_id: "A40",
        dep_code: "988",
      },
      {
        aca_code: "41",
        aca_nom: "Polynésie Française",
        aca_id: "A41",
        dep_code: "987",
      },
      {
        aca_code: "41",
        aca_nom: "Polynésie Française",
        aca_id: "A41",
        dep_code: "989",
      },
      {
        aca_code: "42",
        aca_nom: "Wallis et Futuna",
        aca_id: "A42",
        dep_code: "986",
      },
      {
        aca_code: "44",
        aca_nom: "Saint-Pierre-et-Miquelon",
        aca_id: "A44",
        dep_code: "975",
      },
      {
        aca_code: "32",
        aca_nom: "Guadeloupe",
        aca_id: "A32",
        dep_code: "971",
      },
    ];

    const apiData = [
      ...commonData,
      {
        aca_code: "977",
        aca_nom: "Saint-Barthélemy",
        aca_id: "977",
        dep_code: "977",
      },
      {
        aca_code: "978",
        aca_nom: "Saint-Martin",
        aca_id: "978",
        dep_code: "978",
      },
    ];

    const expectedData = [
      ...commonData,
      {
        aca_code: "32",
        aca_nom: "Guadeloupe",
        aca_id: "A32",
        dep_code: "977",
      },
      {
        aca_code: "32",
        aca_nom: "Guadeloupe",
        aca_id: "A32",
        dep_code: "978",
      },
    ];

    nock("https://data.enseignementsup-recherche.gouv.fr")
      .get("/api/explore/v2.1/catalog/datasets/fr-esr-referentiel-geographique/exports/json")
      .query({ group_by: "dep_code,aca_nom,aca_id,aca_code" })
      //   .query(true)
      .reply(200, apiData, {
        "content-type": "application/json",
        "content-disposition": 'attachment; filename="fr-esr-referentiel-geographique.json"',
      });

    const result = await fetchAcademies();

    expect(result).toEqual(expectedData);
  });
});
