import {
  generateCertificationFixture,
  generateKitApprentissageFixture,
  generateKitApprentissageFixtureData,
  generateSourceBcn_V_FormationDiplomeDataFixture,
  generateSourceBcn_V_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { describe, expect, it, vi } from "vitest";

import { buildCertification } from "./certification.builder";
import { buildCertificationCfd, INiveauInterministerielSearchMap } from "./certification.cfd.builder";
import { buildCertificationPeriodeValidite } from "./certification.periode_validite.builder";
import { buildCertificationRncp } from "./certification.rncp.builder";

vi.mock("./certification.cfd.builder");
vi.mock("./certification.periode_validite.builder");
vi.mock("./certification.rncp.builder");

describe("buildCertification", () => {
  const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
    data: generateSourceBcn_V_FormationDiplomeDataFixture({
      FORMATION_DIPLOME: "20512008",
    }),
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
      bcn: vFormation,
      kit_apprentissage: kitApprentissage,
      france_competence: franceCompetence,
    };

    const {
      _id: _0,
      created_at: _1,
      updated_at: _2,
      ...expectedCertification
    } = generateCertificationFixture({
      code: {
        cfd: "20512008",
        rncp: "RNCP24420",
      },
    });

    vi.mocked(buildCertificationCfd).mockReturnValue(expectedCertification.cfd);
    vi.mocked(buildCertificationRncp).mockReturnValue(expectedCertification.rncp);
    vi.mocked(buildCertificationPeriodeValidite).mockReturnValue(expectedCertification.periode_validite);

    const oldestFranceCompetenceDatePublication = new Date("2021-12-24T02:00:00.000Z");
    const niveauInterministerielSearchMap: INiveauInterministerielSearchMap = {
      fromEuropeen: new Map(),
      fromFormationDiplome: new Map([
        ["010", "0"],
        ["265", "2"],
        ["36T", "3"],
        ["453", "4"],
      ]),
    };

    const certification = buildCertification(
      data,
      oldestFranceCompetenceDatePublication,
      niveauInterministerielSearchMap
    );

    expect(certification).toEqual(expectedCertification);
    expect(certification.cfd).toBe(expectedCertification.cfd);
    expect(certification.rncp).toBe(expectedCertification.rncp);
    expect(certification.periode_validite).toBe(expectedCertification.periode_validite);
    expect(vi.mocked(buildCertificationCfd)).toHaveBeenCalledWith(data.bcn, niveauInterministerielSearchMap);
    expect(vi.mocked(buildCertificationRncp)).toHaveBeenCalledWith(
      data.france_competence,
      oldestFranceCompetenceDatePublication,
      niveauInterministerielSearchMap
    );
    expect(vi.mocked(buildCertificationPeriodeValidite)).toHaveBeenCalledWith(
      expectedCertification.cfd,
      expectedCertification.rncp
    );
  });
});
