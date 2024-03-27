import {
  generateSourceBcn_V_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { describe, expect, it } from "vitest";

import { buildCertificationBlocsCompetences } from "./certification.blocs_competences.builder";

describe("buildCertificationBlocsCompetences", () => {
  it("should returns null when france competence data is missing", () => {
    const result = buildCertificationBlocsCompetences({
      bcn: generateSourceBcn_V_FormationDiplomeFixture(),
      france_competence: null,
    });
    expect(result).toEqual({ rncp: null });
  });

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
      const result = buildCertificationBlocsCompetences({ bcn: null, france_competence: fc });
      expect(result.rncp).toEqual([
        { code: "RNCP38596BC02", intitule: "Réaliser un diagnostic juridique" },
        { code: "RNCP38596BC03", intitule: "Conduire un dossier juridique" },
        { code: "RNCP38596BC04", intitule: "Piloter un projet en contexte juridique" },
        { code: "RNCP38596BC01", intitule: "Conduire un entretien exploratoire auprès d’un client" },
      ]);
    });
  });
  describe("when blocs_de_competences is empty", () => {
    it("should returns empty array", () => {
      const fc = generateSourceFranceCompetenceFixture({ data: { blocs_de_competences: [] } });
      const result = buildCertificationBlocsCompetences({ bcn: null, france_competence: fc });
      expect(result.rncp).toEqual([]);
    });
  });
});
