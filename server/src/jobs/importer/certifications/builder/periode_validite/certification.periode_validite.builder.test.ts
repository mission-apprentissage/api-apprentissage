import { DateTime } from "luxon";
import {
  generateSourceBcn_N_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
  ISourceFranceCompetenceFixtureInput,
} from "shared/models/fixtures";
import { IBcn_V_FormationDiplome } from "shared/models/source/bcn/bcn.v_formation_diplome.model";
import { describe, expect, it } from "vitest";

import { ISourceAggregatedData } from "../certification.builder";
import { buildCertificationPeriodeValidite } from "./certification.periode_validite.builder";

type IGenerateSourceAggregatedDataFixture = {
  cfd: {
    ouverture?: string | null;
    fermeture?: string | null;
    date_premiere_session?: string | null;
    date_derniere_session?: string | null;
  } | null;
  rncp: {
    actif?: "ACTIVE" | "INACTIVE" | null;
    date_premiere_activation?: Date | null;
    date_fin_enregistrement?: string | null;
    date_effet?: string | null;
    date_decision?: string | null;
  } | null;
};

function toParisDateString(date: Date | null | undefined): string | null {
  return date == null ? null : DateTime.fromJSDate(date, { zone: "Europe/Paris" })?.toFormat("dd/MM/yyyy");
}

function generateSourceAggregatedDataFixture(data: IGenerateSourceAggregatedDataFixture): ISourceAggregatedData {
  let bcnData: Partial<IBcn_V_FormationDiplome["data"]> | null = null;

  if (data.cfd !== null) {
    bcnData = {};
    if ("ouverture" in data.cfd) {
      bcnData.DATE_OUVERTURE = data.cfd.ouverture ?? null;
    }
    if ("fermeture" in data.cfd) {
      bcnData.DATE_FERMETURE = data.cfd.fermeture ?? null;
    }
    if ("date_premiere_session" in data.cfd) {
      bcnData.DATE_PREMIERE_SESSION = data.cfd.date_premiere_session;
    }
    if ("date_derniere_session" in data.cfd) {
      bcnData.DATE_DERNIERE_SESSION = data.cfd.date_derniere_session;
    }
  }

  let fcData: Partial<ISourceFranceCompetenceFixtureInput> | null = null;

  if (data.rncp !== null) {
    fcData = { data: { standard: {} } };
    if ("actif" in data.rncp) {
      fcData.data!.standard!.Actif = data.rncp.actif;
    }
    if ("date_premiere_activation" in data.rncp) {
      fcData.date_premiere_activation = data.rncp.date_premiere_activation;
    }
    if ("date_fin_enregistrement" in data.rncp) {
      fcData.data!.standard!.Date_Fin_Enregistrement = data.rncp.date_fin_enregistrement ?? null;
    }
    if ("date_effet" in data.rncp) {
      fcData.data!.standard!.Date_Effet = data.rncp.date_effet ?? null;
    }
    if ("date_decision" in data.rncp) {
      fcData.data!.standard!.Date_Decision = data.rncp.date_decision ?? null;
    }
  }

  return {
    bcn: bcnData === null ? null : generateSourceBcn_N_FormationDiplomeFixture({ data: bcnData }),
    france_competence: fcData === null ? null : generateSourceFranceCompetenceFixture(fcData),
  };
}

describe("buildCertificationPeriodeValidite", () => {
  const oldestFranceCompetenceDatePublication = new Date("2021-12-24T02:00:00.000Z");
  const dateBefore = new Date("2022-12-23T23:00:00.000Z");
  const dateAfter = new Date("2022-12-24T23:00:00.000Z");

  describe("periode_validite.cfd", () => {
    it("should return null when bcn data is missing", () => {
      const result = buildCertificationPeriodeValidite(
        {
          france_competence: generateSourceFranceCompetenceFixture(),
        },
        oldestFranceCompetenceDatePublication
      );
      expect(result.cfd).toEqual(null);
    });

    describe("periode_validite.cfd.ouverture", () => {
      it.each([
        ["06/09/2022", "2022-09-05T22:00:00.000Z"],
        ["11/01/2024", "2024-01-10T23:00:00.000Z"],
      ])("should interprete data.DATE_OUVERTURE value as 00:00:00 Paris timezone", (date, expected) => {
        const data = generateSourceAggregatedDataFixture({
          cfd: { ouverture: date },
          rncp: null,
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.cfd?.ouverture).toEqual(new Date(expected));
      });
      it("should takes null for empty data.DATE_OUVERTURE value", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: { ouverture: null },
          rncp: null,
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.cfd?.ouverture).toBeNull();
      });
    });

    describe("periode_validite.cfd.fermeture", () => {
      it.each([
        ["06/09/2022", "2022-09-06T21:59:59.000Z"],
        ["11/01/2024", "2024-01-11T22:59:59.000Z"],
      ])("should interprete data.DATE_FERMETURE value as 23:59:59 Paris timezone", (date, expected) => {
        const data = generateSourceAggregatedDataFixture({
          cfd: { fermeture: date },
          rncp: null,
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.cfd?.fermeture).toEqual(new Date(expected));
      });

      it("should takes null for empty data.DATE_FERMETURE value", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: { fermeture: null },
          rncp: null,
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.cfd?.fermeture).toBeNull();
      });
    });

    describe("periode_validite.cfd.premiere_session", () => {
      it("should takes data.DATE_PREMIERE_SESSION value as int", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: { date_premiere_session: "2022" },
          rncp: null,
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.cfd?.premiere_session).toBe(2022);
      });
    });

    describe("periode_validite.cfd.derniere_session", () => {
      it("should takes data.DATE_DERNIERE_SESSION value", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: { date_derniere_session: "2024" },
          rncp: null,
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.cfd?.derniere_session).toBe(2024);
      });
    });
  });

  describe("periode_validite.rncp", () => {
    it("should return null when france_competence data is missing", () => {
      const data = generateSourceAggregatedDataFixture({
        cfd: null,
        rncp: null,
      });
      const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
      expect(result.rncp).toEqual(null);
    });

    describe("periode_validite.rncp.activation", () => {
      it("should returns null when date_premiere_activation is null", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: null,
          rncp: {
            date_premiere_activation: null,
          },
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.rncp?.activation).toBeNull();
      });
      it("should returns date_premiere_activation when date_premiere_activation is after oldestFranceCompetenceDatePublication", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: null,
          rncp: {
            date_premiere_activation: new Date("2021-12-25T02:00:00.000Z"),
          },
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.rncp?.activation).toEqual(new Date("2021-12-25T02:00:00.000Z"));
      });
      it("should returns null when date_premiere_activation is oldestFranceCompetenceDatePublication", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: null,
          rncp: {
            date_premiere_activation: oldestFranceCompetenceDatePublication,
          },
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.rncp?.activation).toBeNull();
      });
    });

    describe("periode_validite.rncp.fin_enregistrement", () => {
      it("should returns null when Date_Fin_Enregistrement is null", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: null,
          rncp: {
            date_fin_enregistrement: null,
          },
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.rncp?.fin_enregistrement).toBeNull();
      });
      it.each([
        ["07/05/2024", new Date("2024-05-07T21:59:59.000Z")],
        ["07/11/2024", new Date("2024-11-07T22:59:59.000Z")],
      ])("should returns Date_Fin_Enregistrement as 23:59:59 Paris timezone", (date, expected) => {
        const data = generateSourceAggregatedDataFixture({
          cfd: null,
          rncp: {
            date_fin_enregistrement: date,
          },
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.rncp?.fin_enregistrement).toEqual(expected);
      });
    });

    describe("periode_validite.rncp.debut_parcours", () => {
      describe("when Date_Effet is not null", () => {
        it.each([
          ["07/05/2024", new Date("2024-05-06T22:00:00.000Z")],
          ["07/11/2024", new Date("2024-11-06T23:00:00.000Z")],
        ])("should returns Date_Effet as Day D 00:00:00 Paris timezone", (date, expected) => {
          const data = generateSourceAggregatedDataFixture({
            cfd: null,
            rncp: {
              date_effet: date,
            },
          });
          const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
          expect(result.rncp?.debut_parcours).toEqual(expected);
        });
      });
      describe("when Date_Effet is null", () => {
        describe("when Date_Decision is not null", () => {
          it.each([
            ["07/05/2024", new Date("2024-05-06T22:00:00.000Z")],
            ["07/11/2024", new Date("2024-11-06T23:00:00.000Z")],
          ])("should returns Date_Decision as Day D 00:00:00 Paris timezone", (date, expected) => {
            const data = generateSourceAggregatedDataFixture({
              cfd: null,
              rncp: {
                date_effet: null,
                date_decision: date,
              },
            });
            const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
            expect(result.rncp?.debut_parcours).toEqual(expected);
          });
        });
        describe("when Date_Decision is null", () => {
          it("should returns null", () => {
            const data = generateSourceAggregatedDataFixture({
              cfd: null,
              rncp: {
                date_effet: null,
                date_decision: null,
              },
            });
            const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
            expect(result.rncp?.debut_parcours).toBeNull();
          });
        });
      });
    });

    describe("periode_validite.rncp.actif", () => {
      it("should returns true when standard.Actif is ACTIVE", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: null,
          rncp: { actif: "ACTIVE" },
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.rncp?.actif).toBe(true);
      });
      it("should returns false when standard.Actif is INACTIVE", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: null,
          rncp: { actif: "INACTIVE" },
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.rncp?.actif).toBe(false);
      });
    });
  });

  describe("periode_validite.debut", () => {
    describe("with only bcn data", () => {
      it("should return cfd ouverture", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: { ouverture: toParisDateString(dateBefore) },
          rncp: null,
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.debut).toEqual(dateBefore);
      });
    });

    describe("with only rncp data", () => {
      it("should return rncp activation", () => {
        const data = generateSourceAggregatedDataFixture({
          cfd: null,
          rncp: {
            date_premiere_activation: dateBefore,
          },
        });
        const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
        expect(result.debut).toEqual(dateBefore);
      });
    });

    describe("when rncp.activation exists", () => {
      describe("when cfd.ouverture exists", () => {
        describe("when cfd.ouverture is before rncp.activation", () => {
          it("should set periode_validite.debut to rncp.activation", () => {
            const data = generateSourceAggregatedDataFixture({
              cfd: { ouverture: toParisDateString(dateBefore) },
              rncp: {
                date_premiere_activation: dateAfter,
              },
            });
            const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
            expect(result.debut).toEqual(dateAfter);
          });
        });
        describe("when cfd.ouverture is after rncp.activation", () => {
          it("should set periode_validite.debut to cfd.ouverture", () => {
            const data = generateSourceAggregatedDataFixture({
              cfd: { ouverture: toParisDateString(dateAfter) },
              rncp: {
                date_premiere_activation: dateBefore,
              },
            });
            const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
            expect(result.debut).toEqual(dateAfter);
          });
        });
      });
      describe("when cfd.ouverture is not defined", () => {
        it("should set periode_validite.debut to rncp.activation", () => {
          const data = generateSourceAggregatedDataFixture({
            cfd: { ouverture: null },
            rncp: {
              date_premiere_activation: dateBefore,
            },
          });
          const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
          expect(result.debut).toEqual(dateBefore);
        });
      });
    });

    describe("when rncp.activation is not defined", () => {
      describe("when cfd.ouverture exists", () => {
        it("should set periode_validite.debut to cfd.ouverture", () => {
          const data = generateSourceAggregatedDataFixture({
            cfd: { ouverture: toParisDateString(dateBefore) },
            rncp: {
              date_premiere_activation: null,
            },
          });
          const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
          expect(result.debut).toEqual(dateBefore);
        });
      });
      describe("when cfd.ouverture is not defined", () => {
        it("should set periode_validite.debut to null", () => {
          const data = generateSourceAggregatedDataFixture({
            cfd: { ouverture: null },
            rncp: {
              date_premiere_activation: null,
            },
          });
          const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
          expect(result.debut).toEqual(null);
        });
      });
    });
  });

  describe("periode_validite.fin", () => {
    describe("when rncp.fin_enregistrement is defined", () => {
      describe("when cfd.fermeture exists", () => {
        describe("when cfd.fermeture is before rncp.fin_enregistrement", () => {
          it("should set periode_validite.fin to cfd.fermeture", () => {
            const data = generateSourceAggregatedDataFixture({
              cfd: { fermeture: toParisDateString(dateBefore) },
              rncp: { date_fin_enregistrement: toParisDateString(dateAfter) },
            });
            const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
            expect(result.fin).toEqual(result.cfd?.fermeture);
          });
        });
        describe("when cfd.fermeture is after rncp.fin_enregistrement", () => {
          it("should set periode_validite.fin to rncp.fin_enregistrement", () => {
            const data = generateSourceAggregatedDataFixture({
              cfd: { fermeture: toParisDateString(dateAfter) },
              rncp: { date_fin_enregistrement: toParisDateString(dateBefore) },
            });
            const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
            expect(result.fin).toEqual(result.rncp?.fin_enregistrement);
          });
        });
      });
      describe("when cfd.fermeture is not defined", () => {
        it("should set periode_validite.fin to rncp.fin_enregistrement", () => {
          const data = generateSourceAggregatedDataFixture({
            cfd: { fermeture: null },
            rncp: { date_fin_enregistrement: toParisDateString(dateBefore) },
          });
          const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
          expect(result.fin).toEqual(result.rncp?.fin_enregistrement);
        });
      });
    });
    describe("when rncp.fin_enregistrement is not defined", () => {
      describe("when cfd.fermeture exists", () => {
        it("should set periode_validite.fin to cfd.fermeture", () => {
          const data = generateSourceAggregatedDataFixture({
            cfd: { fermeture: toParisDateString(dateBefore) },
            rncp: { date_fin_enregistrement: null },
          });
          const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
          expect(result.fin).toEqual(result.cfd?.fermeture);
        });
      });
      describe("when cfd.fermeture is not defined", () => {
        it("should set periode_validite.fin to null", () => {
          const data = generateSourceAggregatedDataFixture({
            cfd: { fermeture: null },
            rncp: { date_fin_enregistrement: null },
          });
          const result = buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication);
          expect(result.fin).toEqual(null);
        });
      });
    });
  });
});
