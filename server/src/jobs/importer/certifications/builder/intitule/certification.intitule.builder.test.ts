import { ObjectId } from "mongodb";
import {
  generateSourceBcn_N_FormationDiplomeFixture,
  generateSourceBcn_N_NiveauFormationDiplomeFixtureList,
  generateSourceBcn_N51_FormationDiplomeFixture,
  generateSourceBcn_V_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { beforeEach, describe, expect, it } from "vitest";

import { useMongo } from "../../../../../../tests/mongo.test.utils";
import { getDbCollection } from "../../../../../services/mongodb/mongodbService";
import {
  buildCertificationIntitule,
  validateNiveauFormationDiplomeToInterministerielRule,
} from "./certification.intitule.builder";

describe("buildCertificationIntitule", () => {
  describe("intitule.cfd", () => {
    it("should returns null when bcn data is missing", () => {
      const result = buildCertificationIntitule({
        bcn: null,
        france_competence: generateSourceFranceCompetenceFixture(),
      });
      expect(result.cfd).toEqual(null);
    });

    describe("intitule.cfd.court", () => {
      it("should takes data.LIBELLE_STAT_33 value", () => {
        const vFormation = generateSourceBcn_N_FormationDiplomeFixture({
          data: {
            LIBELLE_STAT_33: "GESTION DE L'ENVIRONNEMENT",
          },
        });
        const result = buildCertificationIntitule({ bcn: vFormation, france_competence: null });
        expect(result.cfd?.court).toBe("GESTION DE L'ENVIRONNEMENT");
      });
    });
    describe("intitule.long", () => {
      it("should takes data.LIBELLE_LONG_200 value", () => {
        const vFormation = generateSourceBcn_N_FormationDiplomeFixture({
          data: {
            LIBELLE_LONG_200: "METIERS DE LA BEAUTE ET DU BIEN-ETRE 2NDE COMMUNE (BAC PRO)",
          },
        });
        const result = buildCertificationIntitule({ bcn: vFormation, france_competence: null });
        expect(result.cfd?.long).toBe("METIERS DE LA BEAUTE ET DU BIEN-ETRE 2NDE COMMUNE (BAC PRO)");
      });
    });
  });

  describe("intitule.rncp", () => {
    it("should returns null when france competence data is missing", () => {
      const result = buildCertificationIntitule({
        bcn: generateSourceBcn_N51_FormationDiplomeFixture(),
        france_competence: null,
      });
      expect(result.rncp).toEqual(null);
    });

    it("should returns standard.Intitule", () => {
      const fc = generateSourceFranceCompetenceFixture({ data: { standard: { Intitule: "foo" } } });
      const result = buildCertificationIntitule({ bcn: null, france_competence: fc });
      expect(result.rncp).toBe("foo");
    });
  });

  describe("intitule.niveau.rncp", () => {
    it("should returns null when france competence data is missing", () => {
      const result = buildCertificationIntitule({
        bcn: generateSourceBcn_N51_FormationDiplomeFixture(),
        france_competence: null,
      });
      expect(result.niveau.rncp).toEqual(null);
    });

    describe("intitule.niveau.rncp.europeen", () => {
      it("should returns parsed value from Nomenclature_Europe_Niveau", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: { standard: { Nomenclature_Europe_Niveau: "NIV5" } },
        });
        const result = buildCertificationIntitule({ france_competence: fc });
        expect(result.niveau).toEqual({ cfd: null, rncp: { europeen: "5" } });
      });
      it("should returns null when Nomenclature_Europe_Niveau is null", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: { standard: { Nomenclature_Europe_Niveau: null } },
        });
        const result = buildCertificationIntitule({ france_competence: fc });
        expect(result.niveau).toEqual({ cfd: null, rncp: { europeen: null } });
      });
      it("should returns null when Nomenclature_Europe_Niveau is REPRISE", () => {
        const fc = generateSourceFranceCompetenceFixture({
          data: { standard: { Nomenclature_Europe_Niveau: "REPRISE" } },
        });
        const result = buildCertificationIntitule({ france_competence: fc });
        expect(result.niveau).toEqual({ cfd: null, rncp: { europeen: null } });
      });
    });
  });

  describe("intitule.niveau.cfd", () => {
    it("should returns null when bcn data is missing", () => {
      const result = buildCertificationIntitule({
        bcn: null,
        france_competence: generateSourceFranceCompetenceFixture(),
      });
      expect(result.niveau.cfd).toEqual(null);
    });

    describe("intitule.niveau.cfd.sigle", () => {
      it("should takes data.LIBELLE_COURT value", () => {
        const vFormation = generateSourceBcn_N_FormationDiplomeFixture({
          data: {
            LIBELLE_COURT: "MC4",
          },
        });
        const result = buildCertificationIntitule({ bcn: vFormation, france_competence: null });
        expect(result.niveau.cfd?.sigle).toBe(vFormation.data.LIBELLE_COURT);
      });
    });
    describe("intitule.niveau.cfd.europeen", () => {
      it("should takes parsed value of data.NIVEAU_QUALIFICATION_RNCP value", () => {
        const vFormation = generateSourceBcn_N_FormationDiplomeFixture({
          data: {
            NIVEAU_QUALIFICATION_RNCP: "05",
          },
        });
        const result = buildCertificationIntitule({ bcn: vFormation, france_competence: null });
        expect(result.niveau.cfd?.europeen).toBe("5");
      });
      it("should takes null for 00 value", () => {
        const vFormation = generateSourceBcn_N_FormationDiplomeFixture({
          data: {
            NIVEAU_QUALIFICATION_RNCP: "00",
          },
        });
        const result = buildCertificationIntitule({ bcn: vFormation, france_competence: null });
        expect(result.niveau.cfd?.europeen).toBeNull();
      });
      it("should takes null for 99 value", () => {
        const vFormation = generateSourceBcn_N51_FormationDiplomeFixture({
          data: {
            NIVEAU_QUALIFICATION_RNCP: "99",
          },
        });
        const result = buildCertificationIntitule({ bcn: vFormation, france_competence: null });
        expect(result.niveau.cfd?.europeen).toBeNull();
      });
      it("should takes null for XX value", () => {
        const vFormation = generateSourceBcn_N51_FormationDiplomeFixture({
          data: {
            NIVEAU_QUALIFICATION_RNCP: "XX",
          },
        });
        const result = buildCertificationIntitule({ bcn: vFormation, france_competence: null });
        expect(result.niveau.cfd?.europeen).toBeNull();
      });
    });

    describe("intitule.niveau.cfd.formation_diplome", () => {
      it("should takes data.NIVEAU_FORMATION_DIPLOME value", () => {
        const vFormation = generateSourceBcn_N51_FormationDiplomeFixture({
          data: {
            NIVEAU_FORMATION_DIPLOME: "010",
          },
        });
        const result = buildCertificationIntitule({ bcn: vFormation, france_competence: null });
        expect(result.niveau.cfd?.formation_diplome).toBe(vFormation.data.NIVEAU_FORMATION_DIPLOME);
      });
    });

    describe("intitule.niveau.cfd.interministeriel", () => {
      it("should takes first character of data.NIVEAU_FORMATION_DIPLOME", () => {
        const vFormation = generateSourceBcn_N_FormationDiplomeFixture({
          data: {
            NIVEAU_FORMATION_DIPLOME: "453",
          },
        });
        const result = buildCertificationIntitule({ bcn: vFormation, france_competence: null });
        expect(result.niveau.cfd?.interministeriel).toBe("4");
      });
    });
  });
});

describe("validateNiveauFormationDiplomeToInterministerielRule", () => {
  useMongo();

  describe("when NIVEAU_INTERMINISTERIEL is always the first character of NIVEAU_FORMATION_DIPLOME", () => {
    beforeEach(async () => {
      await getDbCollection("source.bcn").insertMany(generateSourceBcn_N_NiveauFormationDiplomeFixtureList());
      await getDbCollection("source.bcn").insertMany([
        generateSourceBcn_V_FormationDiplomeFixture(),
        generateSourceBcn_N51_FormationDiplomeFixture(),
      ]);
    });

    it("should resolves to undefined", async () => {
      await expect(validateNiveauFormationDiplomeToInterministerielRule()).resolves.toBeUndefined();
    });
  });

  describe("when NIVEAU_INTERMINISTERIEL is not the first character of NIVEAU_FORMATION_DIPLOME", () => {
    beforeEach(async () => {
      await getDbCollection("source.bcn").insertMany(generateSourceBcn_N_NiveauFormationDiplomeFixtureList());
      await getDbCollection("source.bcn").insertMany([
        generateSourceBcn_V_FormationDiplomeFixture(),
        generateSourceBcn_N51_FormationDiplomeFixture(),
      ]);
      await getDbCollection("source.bcn").insertOne({
        _id: new ObjectId(),
        source: "N_NIVEAU_FORMATION_DIPLOME",
        date: new Date("2024-03-07T00:00:00Z"),
        data: {
          NIVEAU_FORMATION_DIPLOME: "967",
          LIBELLE_COURT: "BAFD",
          DATE_OUVERTURE: null,
          DATE_FERMETURE: null,
          DATE_INTERVENTION: "08/11/2021",
          NIVEAU_QUALIFICATION_RNCP: "00",
          N_NIVEAU_QUALIFICATION_RNCP_LIBELLE_LONG: "HORS PERIMETRE",
          N_COMMENTAIRE: "Création suite à une demande des équipes examens/concours",
          NIVEAU_INTERMINISTERIEL: "6",
          N_NIVEAU_INTERMINISTERIEL_LIBELLE_LONG: "INCONNU",
          LIBELLE_100: "BREVET D'APTITUDE AUX FONCTIONS DE DIRECTEUR",
          ANCIEN_NIVEAU: null,
        },
      });
    });
    it("should rejects", async () => {
      await expect(validateNiveauFormationDiplomeToInterministerielRule()).rejects.toThrow(
        "import.certifications: invalid niveau formation diplome to interministeriel rule"
      );
    });
  });
});
