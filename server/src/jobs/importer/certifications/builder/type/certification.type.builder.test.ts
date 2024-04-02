import {
  generateSourceBcn_V_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { describe, expect, it } from "vitest";

import { buildCertificationType } from "./certification.type.builder";

describe("buildCertificationType", () => {
  describe("type.certificateurs_rncp", () => {
    it("should returns null when france competence data is missing", () => {
      const result = buildCertificationType({
        bcn: generateSourceBcn_V_FormationDiplomeFixture(),
        france_competence: null,
      });
      expect(result.certificateurs_rncp).toEqual(null);
    });
    it("should returns Siret_Certificateur and Nom_Certificateur for each certificateurs", () => {
      const fc = generateSourceFranceCompetenceFixture({
        data: {
          certificateurs: [
            {
              Numero_Fiche: "RNCP38596",
              Siret_Certificateur: "11000007200014",
              Nom_Certificateur: "MINISTERE DU TRAVAIL DU PLEIN EMPLOI ET DE L'INSERTION",
            },
            {
              Numero_Fiche: "RNCP38596",
              Siret_Certificateur: "11004301500012",
              Nom_Certificateur: "MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE",
            },
          ],
        },
      });
      const result = buildCertificationType({ france_competence: fc });
      expect(result.certificateurs_rncp).toEqual([
        { siret: "11000007200014", nom: "MINISTERE DU TRAVAIL DU PLEIN EMPLOI ET DE L'INSERTION" },
        { siret: "11004301500012", nom: "MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE" },
      ]);
    });
  });

  describe("type.enregistrement_rncp", () => {
    it("should returns null when france competence data is missing", () => {
      const result = buildCertificationType({
        bcn: generateSourceBcn_V_FormationDiplomeFixture(),
        france_competence: null,
      });
      expect(result.enregistrement_rncp).toEqual(null);
    });
    it("should returns standard.Type_Enregistrement", () => {
      const fc = generateSourceFranceCompetenceFixture({
        data: { standard: { Type_Enregistrement: "Enregistrement de droit" } },
      });
      const result = buildCertificationType({ france_competence: fc });
      expect(result.enregistrement_rncp).toBe("Enregistrement de droit");
    });
  });

  describe("type.gestionnaire_diplome", () => {
    it("should returns null when bcn data is missing", () => {
      const result = buildCertificationType({
        bcn: null,
        france_competence: generateSourceFranceCompetenceFixture(),
      });
      expect(result.gestionnaire_diplome).toEqual(null);
    });
    it("should takes data.GESTIONNAIRE_FORMATION_DIPLOME value", () => {
      const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          GESTIONNAIRE_FORMATION_DIPLOME: "SPN DEP B4",
        },
      });
      const result = buildCertificationType({ france_competence: null, bcn: vFormation });
      expect(result.gestionnaire_diplome).toBe(vFormation.data.GESTIONNAIRE_FORMATION_DIPLOME);
    });
  });

  describe("type.nature", () => {
    it("should returns null when bcn data is missing", () => {
      const result = buildCertificationType({
        bcn: null,
        france_competence: generateSourceFranceCompetenceFixture(),
      });
      expect(result.nature).toEqual({ cfd: null });
    });

    describe("type.nature.cfd.code", () => {
      it("should takes data.NATURE_FORMATION_DIPLOME value", () => {
        const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
          data: {
            NATURE_FORMATION_DIPLOME: "2",
          },
        });
        const result = buildCertificationType({ bcn: vFormation, france_competence: null });
        expect(result.nature.cfd?.code).toBe(vFormation.data.NATURE_FORMATION_DIPLOME);
      });
    });
    describe("type.nature.cfd.libelle", () => {
      it("should takes data.N_NATURE_FORMATION_DIPLOME_LIBELLE_100 value", () => {
        const vFormation = generateSourceBcn_V_FormationDiplomeFixture({
          data: {
            N_NATURE_FORMATION_DIPLOME_LIBELLE_100: "DIPLOME NATIONAL / DIPLOME D'ETAT",
          },
        });
        const result = buildCertificationType({ bcn: vFormation, france_competence: null });
        expect(result.nature.cfd?.libelle).toBe(vFormation.data.N_NATURE_FORMATION_DIPLOME_LIBELLE_100);
      });
    });
  });

  describe("type.voie_acces", () => {
    it("should returns null when france competence data is missing", () => {
      const result = buildCertificationType({
        bcn: generateSourceBcn_V_FormationDiplomeFixture(),
        france_competence: null,
      });
      expect(result.voie_acces).toEqual({ rncp: null });
    });

    it.each([
      ["En contrat d’apprentissage", "apprentissage"],
      ["Par expérience", "experience"],
      ["Par candidature individuelle", "candidature_individuelle"],
      ["En contrat de professionnalisation", "contrat_professionnalisation"],
      ["Après un parcours de formation continue", "formation_continue"],
      ["Après un parcours de formation sous statut d’élève ou d’étudiant", "formation_statut_eleve"],
    ])('should returns true for Si_Jury "%s"', (jury, expected) => {
      const fc = generateSourceFranceCompetenceFixture({
        data: { voies_d_acces: [{ Numero_Fiche: "RNCP38596", Si_Jury: jury }] },
      });
      const result = buildCertificationType({ france_competence: fc });
      expect(result.voie_acces).toEqual({
        rncp: {
          apprentissage: false,
          experience: false,
          candidature_individuelle: false,
          contrat_professionnalisation: false,
          formation_continue: false,
          formation_statut_eleve: false,
          [expected]: true,
        },
      });
    });

    it('should support multiple "Si_Jury"', () => {
      const fc = generateSourceFranceCompetenceFixture({
        data: {
          voies_d_acces: [
            { Numero_Fiche: "RNCP38596", Si_Jury: "En contrat d’apprentissage" },
            { Numero_Fiche: "RNCP38596", Si_Jury: "Par expérience" },
            { Numero_Fiche: "RNCP38596", Si_Jury: "Par candidature individuelle" },
            { Numero_Fiche: "RNCP38596", Si_Jury: "En contrat de professionnalisation" },
            { Numero_Fiche: "RNCP38596", Si_Jury: "Après un parcours de formation continue" },
            { Numero_Fiche: "RNCP38596", Si_Jury: "Après un parcours de formation sous statut d’élève ou d’étudiant" },
          ],
        },
      });
      const result = buildCertificationType({ france_competence: fc });
      expect(result.voie_acces).toEqual({
        rncp: {
          apprentissage: true,
          experience: true,
          candidature_individuelle: true,
          contrat_professionnalisation: true,
          formation_continue: true,
          formation_statut_eleve: true,
        },
      });
    });

    it('should throw when "Si_Jury" is not part of enum', () => {
      const fc = generateSourceFranceCompetenceFixture({
        data: { voies_d_acces: [{ Numero_Fiche: "RNCP38596", Si_Jury: "foo" }] },
      });
      expect(() => buildCertificationType({ france_competence: fc })).toThrow(
        "import.certifications: unexpected voie d'acces value"
      );
    });
  });
});
