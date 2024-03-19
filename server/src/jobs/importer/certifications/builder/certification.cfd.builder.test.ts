import { generateSourceBcn_V_FormationDiplomeFixture } from "shared/models/fixtures";
import { describe, expect, it } from "vitest";

import { buildCertificationCfd, INiveauInterministerielSearchMap } from "./certification.cfd.builder";

describe("buildCertificationCfd", () => {
  const niveauInterministerielSearchMap: INiveauInterministerielSearchMap = {
    fromEuropeen: new Map(),
    fromFormationDiplome: new Map([
      ["010", "0"],
      ["265", "2"],
      ["36T", "3"],
      ["453", "4"],
    ]),
  };

  it("should returns null for empty data", () => {
    expect(buildCertificationCfd(null, niveauInterministerielSearchMap)).toBeNull();
    expect(buildCertificationCfd(undefined, niveauInterministerielSearchMap)).toBeNull();
  });

  describe("niveau.sigle", () => {
    it("should takes data.LIBELLE_COURT value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          LIBELLE_COURT: "MC4",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.niveau.sigle).toBe(vFormation.data.LIBELLE_COURT);
    });
  });
  describe("niveau.europeen", () => {
    it("should takes parsed value of data.NIVEAU_QUALIFICATION_RNCP value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          NIVEAU_QUALIFICATION_RNCP: "05",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.niveau.europeen).toBe("5");
    });
    it("should takes null for 00 value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          NIVEAU_QUALIFICATION_RNCP: "00",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.niveau.europeen).toBeNull();
    });
    it("should takes null for 99 value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          NIVEAU_QUALIFICATION_RNCP: "99",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.niveau.europeen).toBeNull();
    });
    it("should takes null for XX value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          NIVEAU_QUALIFICATION_RNCP: "XX",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.niveau.europeen).toBeNull();
    });
  });
  describe("niveau.formation_diplome", () => {
    it("should takes data.NIVEAU_FORMATION_DIPLOME value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          NIVEAU_FORMATION_DIPLOME: "010",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.niveau.formation_diplome).toBe(vFormation.data.NIVEAU_FORMATION_DIPLOME);
    });
  });
  describe("niveau.interministeriel", () => {
    it("should takes data.NIVEAU_INTERMINISTERIEL value from niveauInterministerielSearchMap", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          NIVEAU_FORMATION_DIPLOME: "453",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.niveau.interministeriel).toBe("4");
    });
  });
  describe("ouverture", () => {
    it.each([
      ["06/09/2022", "2022-09-05T22:00:00.000Z"],
      ["11/01/2024", "2024-01-10T23:00:00.000Z"],
    ])("should interprete data.DATE_OUVERTURE value as 00:00:00 Paris timezone", (date, expected) => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_OUVERTURE: date,
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.ouverture).toEqual(new Date(expected));
    });
    it("should takes null for empty data.DATE_OUVERTURE value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_OUVERTURE: null,
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.ouverture).toBeNull();
    });
  });
  describe("fermeture", () => {
    it.each([
      ["06/09/2022", "2022-09-06T21:59:59.000Z"],
      ["11/01/2024", "2024-01-11T22:59:59.000Z"],
    ])("should interprete data.DATE_FERMETURE value as 23:59:59 Paris timezone", (date, expected) => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_FERMETURE: date,
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.fermeture).toEqual(new Date(expected));
    });
    it("should takes null for empty data.DATE_FERMETURE value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_FERMETURE: null,
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.fermeture).toBeNull();
    });
  });
  describe("session.premiere", () => {
    it("should takes data.DATE_PREMIERE_SESSION value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_PREMIERE_SESSION: "2022",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.session.premiere).toBe(2022);
    });
  });
  describe("session.derniere", () => {
    it("should takes data.DATE_DERNIERE_SESSION value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_DERNIERE_SESSION: "2024",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.session.fin).toBe(2024);
    });
  });
  describe("intitule.court", () => {
    it("should takes data.LIBELLE_STAT_33 value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          LIBELLE_STAT_33: "GESTION DE L'ENVIRONNEMENT",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.intitule.court).toBe(vFormation.data.LIBELLE_STAT_33);
    });
  });
  describe("intitule.long", () => {
    it("should takes data.LIBELLE_LONG_200 value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          LIBELLE_LONG_200: "METIERS DE LA BEAUTE ET DU BIEN-ETRE 2NDE COMMUNE (BAC PRO)",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.intitule.long).toBe(vFormation.data.LIBELLE_LONG_200);
    });
  });
  describe("nature.code", () => {
    it("should takes data.NATURE_FORMATION_DIPLOME value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          NATURE_FORMATION_DIPLOME: "2",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.nature.code).toBe(vFormation.data.NATURE_FORMATION_DIPLOME);
    });
  });
  describe("nature.libelle", () => {
    it("should takes data.N_NATURE_FORMATION_DIPLOME_LIBELLE_100 value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          N_NATURE_FORMATION_DIPLOME_LIBELLE_100: "DIPLOME NATIONAL / DIPLOME D'ETAT",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.nature.libelle).toBe(vFormation.data.N_NATURE_FORMATION_DIPLOME_LIBELLE_100);
    });
  });
  describe("gestionnaire", () => {
    it("should takes data.GESTIONNAIRE_FORMATION_DIPLOME value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          GESTIONNAIRE_FORMATION_DIPLOME: "SPN DEP B4",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.gestionnaire).toBe(vFormation.data.GESTIONNAIRE_FORMATION_DIPLOME);
    });
  });
  describe("creation", () => {
    it.each([
      ["06/09/2022", "2022-09-05T22:00:00.000Z"],
      ["11/01/2024", "2024-01-10T23:00:00.000Z"],
    ])("should interprete data.DATE_ARRETE_CREATION value as 00:00:00 Paris timezone", (date, expected) => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_ARRETE_CREATION: date,
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.creation).toEqual(new Date(expected));
    });
    it("should takes null for empty data.DATE_ARRETE_CREATION value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_ARRETE_CREATION: null,
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.creation).toBeNull();
    });
  });
  describe("abrogation", () => {
    it.each([
      ["06/09/2022", "2022-09-06T21:59:59.000Z"],
      ["11/01/2024", "2024-01-11T22:59:59.000Z"],
    ])("should interprete data.DATE_ARRETE_ABROGATION value as 23:59:59 Paris timezone", (date, expected) => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_ARRETE_ABROGATION: date,
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.abrogation).toEqual(new Date(expected));
    });
    it("should takes null for empty data.DATE_ARRETE_ABROGATION value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_ARRETE_ABROGATION: null,
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.abrogation).toBeNull();
    });
  });
  describe("nsf", () => {
    it("should takes data.GROUPE_SPECIALITE and data.N_GROUPE_SPECIALITE_LIBELLE_LONG value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          GROUPE_SPECIALITE: "323",
          N_GROUPE_SPECIALITE_LIBELLE_LONG: "INFORMATIQUE, TRAITEMT DE L'INFORMATION",
        },
      });
      const result = buildCertificationCfd(vFormation, niveauInterministerielSearchMap);
      expect(result?.nsf).toEqual([
        {
          code: vFormation.data.GROUPE_SPECIALITE,
          intitule: vFormation.data.N_GROUPE_SPECIALITE_LIBELLE_LONG,
        },
      ]);
    });
  });
});
