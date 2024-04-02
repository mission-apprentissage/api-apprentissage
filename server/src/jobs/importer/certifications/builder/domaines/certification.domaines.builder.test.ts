import {
  generateSourceBcn_V_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { describe, expect, it } from "vitest";

import { buildCertificationDomaines } from "./certification.domaines.builder";

describe("buildCertificationDomaines", () => {
  describe("domaines.formacodes", () => {
    it("should returns null when france competence data is missing", () => {
      const result = buildCertificationDomaines({
        bcn: generateSourceBcn_V_FormationDiplomeFixture(),
        france_competence: null,
      });
      expect(result.formacodes).toEqual({ rncp: null });
    });

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
        const result = buildCertificationDomaines({ france_competence: fc });
        expect(result?.formacodes).toEqual({
          rncp: [
            { code: "31009", intitule: "31009 : Architecture système information" },
            { code: "31052", intitule: "31052 : Data Warehouse" },
          ],
        });
      });
    });

    describe("when formacodes is empty", () => {
      it("should returns empty array", () => {
        const fc = generateSourceFranceCompetenceFixture({ data: { formacode: [] } });
        const result = buildCertificationDomaines({ france_competence: fc });
        expect(result?.formacodes).toEqual({ rncp: [] });
      });
    });
  });

  describe("domaines.rome", () => {
    it("should returns null when france competence data is missing", () => {
      const result = buildCertificationDomaines({
        bcn: generateSourceBcn_V_FormationDiplomeFixture(),
        france_competence: null,
      });
      expect(result.rome).toEqual({ rncp: null });
    });

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
        const result = buildCertificationDomaines({ france_competence: fc });
        expect(result?.rome).toEqual({ rncp: [{ code: "K1903", intitule: "Défense et conseil juridique" }] });
      });
    });
    describe("when rome is empty", () => {
      it("should returns empty array", () => {
        const fc = generateSourceFranceCompetenceFixture({ data: { rome: [] } });
        const result = buildCertificationDomaines({ france_competence: fc });
        expect(result?.rome).toEqual({ rncp: [] });
      });
    });
  });

  describe("domaines.nsf", () => {
    describe("domaines.nsf.rncp", () => {
      it("should returns null when france competence data is missing", () => {
        const result = buildCertificationDomaines({
          bcn: generateSourceBcn_V_FormationDiplomeFixture(),
          france_competence: null,
        });
        expect(result.nsf.rncp).toEqual(null);
      });

      describe("when nsf is not empty", () => {
        it("should returns Codes_Rome_Code and Codes_Rome_Libelle for each blocs_de_competences", () => {
          const fc = generateSourceFranceCompetenceFixture({
            data: {
              nsf: [
                {
                  Numero_Fiche: "RNCP15577",
                  Nsf_Code: "312p",
                  Nsf_Intitule: "312p : Gestion des échanges commerciaux",
                },
                {
                  Numero_Fiche: "RNCP15577",
                  Nsf_Code: "310m",
                  Nsf_Intitule: "310m : Spécialités plurivalentes des échanges et de la gestion",
                },
              ],
            },
          });
          const result = buildCertificationDomaines({ france_competence: fc });
          expect(result.nsf).toEqual({
            cfd: null,
            rncp: [
              { code: "312p", intitule: "312p : Gestion des échanges commerciaux" },
              { code: "310m", intitule: "310m : Spécialités plurivalentes des échanges et de la gestion" },
            ],
          });
        });
      });
      describe("when nsf is empty", () => {
        it("should returns empty array", () => {
          const fc = generateSourceFranceCompetenceFixture({ data: { nsf: [] } });
          const result = buildCertificationDomaines({ france_competence: fc });
          expect(result.nsf).toEqual({ cfd: null, rncp: [] });
        });
      });
    });

    describe("domaines.nsf.cfd", () => {
      it("should returns null when france competence data is missing", () => {
        const result = buildCertificationDomaines({
          bcn: null,
          france_competence: generateSourceFranceCompetenceFixture(),
        });
        expect(result.nsf.cfd).toEqual(null);
      });

      describe("when nsf is not empty", () => {
        it("should returns Codes_Rome_Code and Codes_Rome_Libelle for each blocs_de_competences", () => {
          const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
            data: {
              GROUPE_SPECIALITE: "323",
              N_GROUPE_SPECIALITE_LIBELLE_LONG: "INFORMATIQUE, TRAITEMT DE L'INFORMATION",
            },
          });
          const result = buildCertificationDomaines({ france_competence: null, bcn: vFormation });
          expect(result.nsf).toEqual({
            cfd: {
              code: "323",
              intitule: "INFORMATIQUE, TRAITEMT DE L'INFORMATION",
            },
            rncp: null,
          });
        });
      });

      describe("when libelle is empty", () => {
        it("should returns empty array", () => {
          const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
            data: {
              GROUPE_SPECIALITE: "323",
              N_GROUPE_SPECIALITE_LIBELLE_LONG: null,
            },
          });
          const result = buildCertificationDomaines({ france_competence: null, bcn: vFormation });
          expect(result.nsf).toEqual({
            cfd: {
              code: "323",
              intitule: null,
            },
            rncp: null,
          });
        });
      });
    });
  });
});
