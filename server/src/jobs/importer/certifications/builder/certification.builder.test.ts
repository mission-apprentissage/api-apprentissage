import { ICertification } from "shared/models/certification.model";
import {
  generateCertificationFixture,
  generateKitApprentissageFixture,
  generateKitApprentissageFixtureData,
  generateSourceBcn_N_FormationDiplomeFixture,
  generateSourceBcn_N51_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { buildCertificationBaseLegale } from "./base_legale/certification.base_legale.builder";
import { buildCertificationBlocsCompetences } from "./blocs_competences/certification.blocs_competences.builder";
import { buildCertification } from "./certification.builder";
import { buildCertificationConventionCollectives } from "./convention_collectives/certification.convention_collectives.builder";
import { buildCertificationDomaines } from "./domaines/certification.domaines.builder";
import { buildCertificationIntitule } from "./intitule/certification.intitule.builder";
import { buildCertificationPeriodeValidite } from "./periode_validite/certification.periode_validite.builder";
import { buildCertificationType } from "./type/certification.type.builder";

vi.mock("./base_legale/certification.base_legale.builder");
vi.mock("./blocs_competences/certification.blocs_competences.builder");
vi.mock("./convention_collectives/certification.convention_collectives.builder");
vi.mock("./domaines/certification.domaines.builder");
vi.mock("./intitule/certification.intitule.builder");
vi.mock("./periode_validite/certification.periode_validite.builder");
vi.mock("./type/certification.type.builder");

function mockBuildCertificationParts(
  expectedCertification: Pick<
    ICertification,
    | "base_legale"
    | "blocs_competences"
    | "convention_collectives"
    | "domaines"
    | "intitule"
    | "periode_validite"
    | "type"
  >
) {
  vi.mocked(buildCertificationBaseLegale).mockReturnValue(expectedCertification.base_legale);
  vi.mocked(buildCertificationBlocsCompetences).mockReturnValue(expectedCertification.blocs_competences);
  vi.mocked(buildCertificationConventionCollectives).mockReturnValue(expectedCertification.convention_collectives);
  vi.mocked(buildCertificationDomaines).mockReturnValue(expectedCertification.domaines);
  vi.mocked(buildCertificationIntitule).mockReturnValue(expectedCertification.intitule);
  vi.mocked(buildCertificationPeriodeValidite).mockReturnValue(expectedCertification.periode_validite);
  vi.mocked(buildCertificationType).mockReturnValue(expectedCertification.type);
}

describe("buildCertification", () => {
  describe("identifiant.rncp_anterieur_2019", () => {
    it("should be null when france_competence is missing", () => {
      const data = {
        bcn: generateSourceBcn_N_FormationDiplomeFixture({ data: { FORMATION_DIPLOME: "20512008" } }),
        france_competence: null,
      };
      const expectedCertification = generateCertificationFixture({
        identifiant: {
          cfd: "20512008",
          rncp: null,
          rncp_anterieur_2019: null,
        },
      });
      mockBuildCertificationParts(expectedCertification);
      const certification = buildCertification(data, new Date());

      expect(certification.identifiant.rncp_anterieur_2019).toBeNull();
    });

    it.each([
      ["RNCP9999", true],
      ["RNCP33999", true],
      ["RNCP34000", false],
      ["RNCP34001", false],
    ])("should be %p when rncp is %p", (rncp, expected) => {
      const data = {
        bcn: null,
        france_competence: generateSourceFranceCompetenceFixture({ numero_fiche: rncp }),
      };
      const expectedCertification = generateCertificationFixture({
        identifiant: {
          cfd: null,
          rncp: rncp,
          rncp_anterieur_2019: expected,
        },
      });
      mockBuildCertificationParts(expectedCertification);

      const oldestFranceCompetenceDatePublication = new Date();
      const certification = buildCertification(data, oldestFranceCompetenceDatePublication);

      expect(certification.identifiant.rncp_anterieur_2019).toBe(expected);
      expect.soft(buildCertificationBaseLegale).toHaveBeenCalledWith(data);
      expect.soft(buildCertificationBlocsCompetences).toHaveBeenCalledWith(data);
      expect.soft(buildCertificationConventionCollectives).toHaveBeenCalledWith(data);
      expect.soft(buildCertificationDomaines).toHaveBeenCalledWith(data);
      expect.soft(buildCertificationIntitule).toHaveBeenCalledWith(data);
      expect.soft(buildCertificationPeriodeValidite).toHaveBeenCalledWith(data, oldestFranceCompetenceDatePublication);
      expect.soft(buildCertificationType).toHaveBeenCalledWith(data);
    });
  });

  const formation = generateSourceBcn_N51_FormationDiplomeFixture({
    data: {
      FORMATION_DIPLOME: "20512008",
    },
  });

  const kitApprentissage = generateKitApprentissageFixture({
    data: generateKitApprentissageFixtureData({
      "Code Diplôme": "20512008",
      FicheRNCP: "RNCP24420",
    }),
  });

  const franceCompetence = generateSourceFranceCompetenceFixture({ numero_fiche: "RNCP24420" });

  it("should build certification", () => {
    const data = {
      bcn: formation,
      kit_apprentissage: kitApprentissage,
      france_competence: franceCompetence,
    };

    const {
      _id: _0,
      created_at: _1,
      updated_at: _2,
      ...expectedCertification
    } = generateCertificationFixture({
      identifiant: {
        cfd: "20512008",
        rncp: "RNCP24420",
        rncp_anterieur_2019: true,
      },
      continuite: { rncp: null, cfd: null },
    });

    mockBuildCertificationParts(expectedCertification);
    const oldestFranceCompetenceDatePublication = new Date("2021-12-24T02:00:00.000Z");

    const certification = buildCertification(data, oldestFranceCompetenceDatePublication);

    expect(certification).toEqual(expectedCertification);
    expect.soft(buildCertificationBaseLegale).toHaveBeenCalledWith(data);
    expect.soft(buildCertificationBlocsCompetences).toHaveBeenCalledWith(data);
    expect.soft(buildCertificationConventionCollectives).toHaveBeenCalledWith(data);
    expect.soft(buildCertificationDomaines).toHaveBeenCalledWith(data);
    expect.soft(buildCertificationIntitule).toHaveBeenCalledWith(data);
    expect.soft(buildCertificationPeriodeValidite).toHaveBeenCalledWith(data, oldestFranceCompetenceDatePublication);
    expect.soft(buildCertificationType).toHaveBeenCalledWith(data);
  });

  it("should throw if built certification is invalid", () => {
    const data = {
      bcn: formation,
      kit_apprentissage: kitApprentissage,
      france_competence: { ...franceCompetence, numero_fiche: "RNCP24X20" },
    };

    const {
      _id: _0,
      created_at: _1,
      updated_at: _2,
      ...expectedCertification
    } = generateCertificationFixture({
      identifiant: {
        cfd: "20512008",
        rncp: "RNCP24X20",
        rncp_anterieur_2019: true,
      },
    });

    mockBuildCertificationParts(expectedCertification);
    const oldestFranceCompetenceDatePublication = new Date("2021-12-24T02:00:00.000Z");

    expect(() => buildCertification(data, oldestFranceCompetenceDatePublication)).toThrow(ZodError);
  });
});
