import {
  generateSourceBcn_V_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { describe, expect, it } from "vitest";

import { buildCertificationConventionCollectives } from "./certification.convention_collectives.builder";

describe("buildCertificationConventionCollectives", () => {
  it("should returns null when france competence data is missing", () => {
    const result = buildCertificationConventionCollectives({
      bcn: generateSourceBcn_V_FormationDiplomeFixture(),
      france_competence: null,
    });
    expect(result).toEqual({ rncp: null });
  });

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
      const result = buildCertificationConventionCollectives({ france_competence: fc });
      expect(result.rncp).toEqual([{ numero: "3292", intitule: "Hôtels, cafés, restaurants (HCR)" }]);
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
      const result = buildCertificationConventionCollectives({ france_competence: fc });
      expect(result.rncp).toEqual([
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
      const result = buildCertificationConventionCollectives({ france_competence: fc });
      expect(result.rncp).toEqual([{ numero: "3109", intitule: "Métallurgie" }]);
    });
  });
  describe("when ccn is empty", () => {
    it("should returns empty array", () => {
      const fc = generateSourceFranceCompetenceFixture({ data: { ccn: [] } });
      const result = buildCertificationConventionCollectives({ france_competence: fc });
      expect(result.rncp).toEqual([]);
    });
  });
});
