import { generateSourceFranceCompetenceFixture } from "shared/models/fixtures";
import { describe, expect, it } from "vitest";

import { INiveauInterministerielSearchMap } from "./certification.cfd.builder";
import { buildCertificationRncp } from "./certification.rncp.builder";

describe("buildCertificationRncp", () => {
  const niveauInterministerielSearchMap: INiveauInterministerielSearchMap = {
    fromEuropeen: new Map([
      ["3", "5"],
      ["4", "4"],
      ["5", "3"],
      ["6", "2"],
      ["7", "1"],
      ["8", "1"],
      [null, "00"],
    ]),
    fromFormationDiplome: new Map([
      ["010", "0"],
      ["265", "2"],
      ["36T", "3"],
      ["453", "4"],
    ]),
  };

  const oldestFranceCompetenceDatePublication = new Date("2021-12-24T02:00:00.000Z");

  it("should returns null for empty data", () => {
    expect(
      buildCertificationRncp(null, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap)
    ).toBeNull();
    expect(
      buildCertificationRncp(undefined, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap)
    ).toBeNull();
  });

  describe("actif", () => {
    it("should returns true when standard.Actif is ACTIVE", () => {
      const fc = generateSourceFranceCompetenceFixture({ data: { standard: { Actif: "ACTIVE" } } });
      const result = buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap);
      expect(result?.actif).toBe(true);
    });
    it("should returns false when standard.Actif is INACTIVE", () => {
      const fc = generateSourceFranceCompetenceFixture({ data: { standard: { Actif: "INACTIVE" } } });
      const result = buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap);
      expect(result?.actif).toBe(false);
    });
  });

  describe("activation", () => {
    it("should returns null when date_premiere_activation is null", () => {
      const fc = generateSourceFranceCompetenceFixture({ date_premiere_activation: null });
      const result = buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap);
      expect(result?.activation).toBeNull();
    });
    it("should returns date_premiere_activation when date_premiere_activation is after oldestFranceCompetenceDatePublication", () => {
      const fc = generateSourceFranceCompetenceFixture({
        date_premiere_activation: new Date("2021-12-25T02:00:00.000Z"),
      });
      const result = buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap);
      expect(result?.activation).toEqual(new Date("2021-12-25T02:00:00.000Z"));
    });
    it("should returns null when date_premiere_activation is oldestFranceCompetenceDatePublication", () => {
      const fc = generateSourceFranceCompetenceFixture({
        date_premiere_activation: oldestFranceCompetenceDatePublication,
      });
      const result = buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap);
      expect(result?.activation).toBeNull();
    });
  });

  describe("fin_enregistrement", () => {
    it("should returns null when Date_Fin_Enregistrement is null", () => {
      const fc = generateSourceFranceCompetenceFixture({ data: { standard: { Date_Fin_Enregistrement: null } } });
      const result = buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap);
      expect(result?.fin_enregistrement).toBeNull();
    });
    it.each([
      ["07/05/2024", new Date("2024-05-06T21:59:59.000Z")],
      ["07/11/2024", new Date("2024-11-06T22:59:59.000Z")],
    ])("should returns Date_Fin_Enregistrement as Day D-1 23:59:59 Paris timezone", (date, expected) => {
      const fc = generateSourceFranceCompetenceFixture({ data: { standard: { Date_Fin_Enregistrement: date } } });
      const result = buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap);
      expect(result?.fin_enregistrement).toEqual(expected);
    });
  });
  describe("debut_parcours", () => {
    describe("when Date_Effet is not null", () => {
      it.each([
        ["07/05/2024", new Date("2024-05-06T22:00:00.000Z")],
        ["07/11/2024", new Date("2024-11-06T23:00:00.000Z")],
      ])("should returns Date_Effet as Day D 00:00:00 Paris timezone", (date, expected) => {
        const fc = generateSourceFranceCompetenceFixture({ data: { standard: { Date_Effet: date } } });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.debut_parcours).toEqual(expected);
      });
    });
    describe("when Date_Effet is null", () => {
      describe("when Date_Decision is not null", () => {
        it.each([
          ["07/05/2024", new Date("2024-05-06T22:00:00.000Z")],
          ["07/11/2024", new Date("2024-11-06T23:00:00.000Z")],
        ])("should returns Date_Decision as Day D 00:00:00 Paris timezone", (date, expected) => {
          const fc = generateSourceFranceCompetenceFixture({
            data: { standard: { Date_Effet: null, Date_Decision: date } },
          });
          const result = buildCertificationRncp(
            fc,
            oldestFranceCompetenceDatePublication,
            niveauInterministerielSearchMap
          );
          expect(result?.debut_parcours).toEqual(expected);
        });
      });
      describe("when Date_Decision is null", () => {
        it("should returns null", () => {
          const fc = generateSourceFranceCompetenceFixture({
            data: { standard: { Date_Effet: null, Date_Decision: null } },
          });
          const result = buildCertificationRncp(
            fc,
            oldestFranceCompetenceDatePublication,
            niveauInterministerielSearchMap
          );
          expect(result?.debut_parcours).toBeNull();
        });
      });
    });
  });
  describe("intitule", () => {
    it("should returns standard.Intitule", () => {
      const fc = generateSourceFranceCompetenceFixture({ data: { standard: { Intitule: "foo" } } });
      const result = buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap);
      expect(result?.intitule).toBe("foo");
    });
  });
  describe("blocs", () => {
    describe("when blocs_de_competences is not empty", () => {
      it("should returns Bloc_Competence_Code and Bloc_Competence_Libelle for each blocs_de_competences", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: {
            blocs_de_competences: [
              {
                Numero_Fiche: "RNCP38596",
                Bloc_Competences_Code: "RNCP38596BC02",
                Bloc_Competences_Libelle: "Réaliser un diagnostic juridique",
              },
              {
                Numero_Fiche: "RNCP38596",
                Bloc_Competences_Code: "RNCP38596BC03",
                Bloc_Competences_Libelle: "Conduire un dossier juridique",
              },
              {
                Numero_Fiche: "RNCP38596",
                Bloc_Competences_Code: "RNCP38596BC04",
                Bloc_Competences_Libelle: "Piloter un projet en contexte juridique",
              },
              {
                Numero_Fiche: "RNCP38596",
                Bloc_Competences_Code: "RNCP38596BC01",
                Bloc_Competences_Libelle: "Conduire un entretien exploratoire auprès d’un client",
              },
            ],
          },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.blocs).toEqual([
          { code: "RNCP38596BC02", intitule: "Réaliser un diagnostic juridique" },
          { code: "RNCP38596BC03", intitule: "Conduire un dossier juridique" },
          { code: "RNCP38596BC04", intitule: "Piloter un projet en contexte juridique" },
          { code: "RNCP38596BC01", intitule: "Conduire un entretien exploratoire auprès d’un client" },
        ]);
      });
      it("should throw when code doesn't match /^RNCP\\d{3,5}BC\\d{1,2}$", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: {
            blocs_de_competences: [
              {
                Numero_Fiche: "RNCP38596",
                Bloc_Competences_Code: "foo",
                Bloc_Competences_Libelle: "bar",
              },
            ],
          },
        });
        expect(() =>
          buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap)
        ).toThrow("import.certifications: failed to build certification RNCP");
      });
    });
    describe("when blocs_de_competences is empty", () => {
      it("should returns empty array", () => {
        const fc = generateSourceFranceCompetenceFixture({ data: { blocs_de_competences: [] } });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.blocs).toEqual([]);
      });
    });
  });
  describe("rome", () => {
    describe("when romes is not empty", () => {
      it("should returns Codes_Rome_Code and Codes_Rome_Libelle for each blocs_de_competences", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: {
            rome: [
              {
                Numero_Fiche: "RNCP38596",
                Codes_Rome_Code: "K1903",
                Codes_Rome_Libelle: "Défense et conseil juridique",
              },
            ],
          },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.rome).toEqual([{ code: "K1903", intitule: "Défense et conseil juridique" }]);
      });
    });
    describe("when blocs_de_competences is empty", () => {
      it("should returns empty array", () => {
        const fc = generateSourceFranceCompetenceFixture({ data: { rome: [] } });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.rome).toEqual([]);
      });
    });
  });
  describe("formacodes", () => {
    describe("when formacodes is not empty", () => {
      it("should returns Formacode_Code and Formacode_Libelle for each formacodes", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: {
            formacode: [
              {
                Numero_Fiche: "RNCP36137",
                Formacode_Code: "31009",
                Formacode_Libelle: "31009 : Architecture système information",
              },
              {
                Numero_Fiche: "RNCP36137",
                Formacode_Code: "31052",
                Formacode_Libelle: "31052 : Data Warehouse",
              },
            ],
          },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.formacodes).toEqual([
          { code: "31009", intitule: "31009 : Architecture système information" },
          { code: "31052", intitule: "31052 : Data Warehouse" },
        ]);
      });
    });
    describe("when formacodes is empty", () => {
      it("should returns empty array", () => {
        const fc = generateSourceFranceCompetenceFixture({ data: { formacode: [] } });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.formacodes).toEqual([]);
      });
    });
  });
  describe("convention_collectives", () => {
    describe("when ccn is not empty", () => {
      it("should returns Ccn_1_Numero and Ccn_1_Libelle for each ccn", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: {
            ccn: [
              {
                Numero_Fiche: "RNCP37868",
                Ccn_1_Numero: "3292",
                Ccn_1_Libelle: "Hôtels, cafés, restaurants (HCR)",
                Ccn_2_Numero: null,
                Ccn_2_Libelle: null,
                Ccn_3_Numero: null,
                Ccn_3_Libelle: null,
              },
            ],
          },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.convention_collectives).toEqual([
          { numero: "3292", intitule: "Hôtels, cafés, restaurants (HCR)" },
        ]);
      });
      it("should returns Ccn_2_Numero and Ccn_2_Libelle for each ccn", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: {
            ccn: [
              {
                Numero_Fiche: "RNCP37868",
                Ccn_1_Numero: "3292",
                Ccn_1_Libelle: "Hôtels, cafés, restaurants (HCR)",
                Ccn_2_Numero: "3109",
                Ccn_2_Libelle: "Métallurgie",
                Ccn_3_Numero: null,
                Ccn_3_Libelle: null,
              },
            ],
          },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.convention_collectives).toEqual([
          { numero: "3292", intitule: "Hôtels, cafés, restaurants (HCR)" },
          { numero: "3109", intitule: "Métallurgie" },
        ]);
      });
      it("should returns Ccn_3_Numero and Ccn_3_Libelle for each ccn", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: {
            ccn: [
              {
                Numero_Fiche: "RNCP37868",
                Ccn_1_Numero: null,
                Ccn_1_Libelle: null,
                Ccn_2_Numero: null,
                Ccn_2_Libelle: null,
                Ccn_3_Numero: "3109",
                Ccn_3_Libelle: "Métallurgie",
              },
            ],
          },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.convention_collectives).toEqual([{ numero: "3109", intitule: "Métallurgie" }]);
      });
    });
    describe("when ccn is empty", () => {
      it("should returns empty array", () => {
        const fc = generateSourceFranceCompetenceFixture({ data: { ccn: [] } });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.convention_collectives).toEqual([]);
      });
    });
    describe("niveau.europeen", () => {
      it("should returns parsed value from Nomenclature_Europe_Niveau", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: { standard: { Nomenclature_Europe_Niveau: "NIV5" } },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.niveau.europeen).toBe("5");
      });
      it("should returns null when Nomenclature_Europe_Niveau is null", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: { standard: { Nomenclature_Europe_Niveau: null } },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.niveau.europeen).toBeNull();
      });
      it("should returns null when Nomenclature_Europe_Niveau is REPRISE", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: { standard: { Nomenclature_Europe_Niveau: "REPRISE" } },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.niveau.europeen).toBeNull();
      });
    });
    describe("niveau.interministeriel", () => {
      it("should returns value from niveauInterministerielSearchMap.fromEuropeen", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: { standard: { Nomenclature_Europe_Niveau: "NIV5" } },
        });
        const result = buildCertificationRncp(
          fc,
          oldestFranceCompetenceDatePublication,
          niveauInterministerielSearchMap
        );
        expect(result?.niveau.interministeriel).toBe("3");
      });
    });
  });

  describe("rncp.enregistrement", () => {
    it("should returns standard.Type_Enregistrement", () => {
      const fc = generateSourceFranceCompetenceFixture({
        data: { standard: { Type_Enregistrement: "Enregistrement de droit" } },
      });
      const result = buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap);
      expect(result?.enregistrement).toBe("Enregistrement de droit");
    });
    it("should error when standard.Type_Enregistrement is not part of enum", () => {
      // @ts-expect-error
      const fc = generateSourceFranceCompetenceFixture({ data: { standard: { Type_Enregistrement: "foo" } } });
      expect(() =>
        buildCertificationRncp(fc, oldestFranceCompetenceDatePublication, niveauInterministerielSearchMap)
      ).toThrow("import.certifications: failed to build certification RNCP");
    });
  });
});
