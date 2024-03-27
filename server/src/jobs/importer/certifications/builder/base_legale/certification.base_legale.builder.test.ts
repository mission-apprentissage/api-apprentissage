import {
  generateSourceBcn_V_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { describe, expect, it } from "vitest";

import { buildCertificationBaseLegale } from "./certification.base_legale.builder";

describe("buildCertificationBaseLegale", () => {
  it("should returns null when bcn data is missing", () => {
    const result = buildCertificationBaseLegale({
      bcn: null,
      france_competence: generateSourceFranceCompetenceFixture(),
    });
    expect(result).toEqual({ cfd: null });
  });

  describe("base_legale.cfd.creation", () => {
    it.each([
      ["06/09/2022", "2022-09-05T22:00:00.000Z"],
      ["11/01/2024", "2024-01-10T23:00:00.000Z"],
    ])("should interprete data.DATE_ARRETE_CREATION value as 00:00:00 Paris timezone", (date, expected) => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_ARRETE_CREATION: date,
        },
      });
      const result = buildCertificationBaseLegale({
        bcn: vFormation,
        france_competence: generateSourceFranceCompetenceFixture(),
      });
      expect(result.cfd?.creation).toEqual(new Date(expected));
    });
    it("should takes null for empty data.DATE_ARRETE_CREATION value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_ARRETE_CREATION: null,
        },
      });
      const result = buildCertificationBaseLegale({
        bcn: vFormation,
        france_competence: generateSourceFranceCompetenceFixture(),
      });
      expect(result.cfd?.creation).toBeNull();
    });
  });
  describe("base_legale.cfd.abrogation", () => {
    it.each([
      ["06/09/2022", "2022-09-06T21:59:59.000Z"],
      ["11/01/2024", "2024-01-11T22:59:59.000Z"],
    ])("should interprete data.DATE_ARRETE_ABROGATION value as 23:59:59 Paris timezone", (date, expected) => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_ARRETE_ABROGATION: date,
        },
      });
      const result = buildCertificationBaseLegale({
        bcn: vFormation,
        france_competence: generateSourceFranceCompetenceFixture(),
      });
      expect(result.cfd?.abrogation).toEqual(new Date(expected));
    });
    it("should takes null for empty data.DATE_ARRETE_ABROGATION value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          DATE_ARRETE_ABROGATION: null,
        },
      });
      const result = buildCertificationBaseLegale({
        bcn: vFormation,
        france_competence: generateSourceFranceCompetenceFixture(),
      });
      expect(result.cfd?.abrogation).toBeNull();
    });
  });
});
