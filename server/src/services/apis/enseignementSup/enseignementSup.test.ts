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
});
