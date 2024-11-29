import nock from "nock";
import { describe, expect, it } from "vitest";

import { fetchDepartementMissionLocale } from "./unml.js";

describe("fetchDepartementMissionLocale", () => {
  it("should return the list of departements of the region", async () => {
    const structure = {
      id: 226,
      code: "QHa5dWn8eeYM66ckCsD7W76sac4kDW5y",
      numAdherent: 226,
      structureStatutId: 2,
      structureTypeId: 8,
      nomStructure: "AGIRE VAL DE MARQUE",
      porteusePLIE: true,
      porteuseMDE: true,
      porteuseML: true,
      effectif: "38",
      effectifETP: "37.57",
      adresse1: "Parvis Berthelot",
      adresse2: "BP 10405",
      cp: "59510",
      ville: "HEM",
      telephones: "03 20 00 00 00",
      fax: "03 20 00 00 00",
      siret: "13001629800015",
      siteWeb: "https://www.mde-valdemarque.fr/",
      emailAccueil: "info@mail.fr",
      geoloc_lng: "3.18881",
      geoloc_lat: "50.654867",
      linkedin: "",
      twitter: "",
      reseau: true,
      anneeAdhesion: 2024,
      annuaire: false,
      facebook: "",
      codeDepartement: "59",
      codeRegion: "32",
      dateModification: 1665562342,
      nbAntennes: 1,
      codeStructure: "59299",
      serviceCivique: false,
      isPartenaire: false,
      label: false,
      labelDate: 0,
      typologie: "",
      structureTypeLibelle: "GIP",
      structureStatutLibelle: "GIP COMPTA PRIVEE",
      nomDepartement: "Nord",
      nomRegion: "Hauts-de-France",
      alias: "HEM",
    };

    const payload = {
      results: [
        {
          id: 15507,
          structureId: 226,
          codePostal: "59510",
          ville: "FORESAINT SUR MARQUE",
          structure,
        },
        {
          id: 15508,
          structureId: 226,
          codePostal: "59510",
          ville: "HEM",
          structure,
        },
        {
          id: 15509,
          structureId: 226,
          codePostal: "59390",
          ville: "LANNOY",
          structure,
        },
      ],
      total: 2,
      success: true,
    };

    nock("https://api.unml.info").get("/TrouveTaML/").query({ search_: "59" }).reply(200, payload);

    const result = await fetchDepartementMissionLocale("59");

    expect(result).toEqual(payload);
  });
});
