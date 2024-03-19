import { generateCertificationFixture } from "shared/models/fixtures";
import { describe, expect, it } from "vitest";

import { buildCertificationPeriodeValidite } from "./certification.periode_validite.builder";

describe("buildCertificationPeriodeValidite", () => {
  const dateBefore = new Date("2022-12-24T02:00:00.000Z");
  const dateAfter = new Date("2022-12-25T02:00:00.000Z");

  describe("periode_validite.debut", () => {
    describe("when rncp.activation exists", () => {
      describe("when cfd.ouverture exists", () => {
        describe("when cfd.ouverture is before rncp.activation", () => {
          it("should set periode_validite.debut to rncp.activation", () => {
            const expectedCertification = generateCertificationFixture({
              cfd: { ouverture: dateBefore },
              rncp: { activation: dateAfter },
              periode_validite: {
                debut: dateAfter,
              },
            });
            const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
            expect(result.debut).toEqual(dateAfter);
          });
        });
        describe("when cfd.ouverture is after rncp.activation", () => {
          it("should set periode_validite.debut to cfd.ouverture", () => {
            const expectedCertification = generateCertificationFixture({
              cfd: { ouverture: dateAfter },
              rncp: { activation: dateBefore },
              periode_validite: {
                debut: dateBefore,
              },
            });
            const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
            expect(result.debut).toEqual(dateAfter);
          });
        });
      });
      describe("when cfd.ouverture is not defined", () => {
        it("should set periode_validite.debut to rncp.activation", () => {
          const expectedCertification = generateCertificationFixture({
            cfd: { ouverture: null },
            rncp: { activation: dateBefore },
            periode_validite: {
              debut: dateBefore,
            },
          });
          const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
          expect(result.debut).toEqual(dateBefore);
        });
      });
    });

    describe("when rncp.activation is not defined", () => {
      describe("when cfd.ouverture exists", () => {
        it("should set periode_validite.debut to cfd.ouverture", () => {
          const expectedCertification = generateCertificationFixture({
            cfd: { ouverture: dateBefore },
            rncp: { activation: null },
            periode_validite: {
              debut: dateBefore,
            },
          });
          const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
          expect(result.debut).toEqual(dateBefore);
        });
      });
      describe("when cfd.ouverture is not defined", () => {
        it("should set periode_validite.debut to null", () => {
          const expectedCertification = generateCertificationFixture({
            cfd: { ouverture: null },
            rncp: { activation: null },
            periode_validite: {
              debut: null,
            },
          });
          const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
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
            const expectedCertification = generateCertificationFixture({
              cfd: { fermeture: dateBefore },
              rncp: { fin_enregistrement: dateAfter },
              periode_validite: {
                fin: dateBefore,
              },
            });
            const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
            expect(result.fin).toEqual(dateBefore);
          });
        });
        describe("when cfd.fermeture is after rncp.fin_enregistrement", () => {
          it("should set periode_validite.fin to rncp.fin_enregistrement", () => {
            const expectedCertification = generateCertificationFixture({
              cfd: { fermeture: dateAfter },
              rncp: { fin_enregistrement: dateBefore },
              periode_validite: {
                fin: dateBefore,
              },
            });
            const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
            expect(result.fin).toEqual(dateBefore);
          });
        });
      });
      describe("when cfd.fermeture is not defined", () => {
        it("should set periode_validite.fin to rncp.fin_enregistrement", () => {
          const expectedCertification = generateCertificationFixture({
            cfd: { fermeture: null },
            rncp: { fin_enregistrement: dateBefore },
            periode_validite: {
              fin: dateBefore,
            },
          });
          const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
          expect(result.fin).toEqual(dateBefore);
        });
      });
    });
    describe("when rncp.fin_enregistrement is not defined", () => {
      describe("when cfd.fermeture exists", () => {
        it("should set periode_validite.fin to cfd.fermeture", () => {
          const expectedCertification = generateCertificationFixture({
            cfd: { fermeture: dateBefore },
            rncp: { fin_enregistrement: null },
            periode_validite: {
              fin: dateBefore,
            },
          });
          const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
          expect(result.fin).toEqual(dateBefore);
        });
      });
      describe("when cfd.fermeture is not defined", () => {
        it("should set periode_validite.fin to null", () => {
          const expectedCertification = generateCertificationFixture({
            cfd: { fermeture: null },
            rncp: { fin_enregistrement: null },
            periode_validite: {
              fin: null,
            },
          });
          const result = buildCertificationPeriodeValidite(expectedCertification.cfd, expectedCertification.rncp);
          expect(result.fin).toEqual(null);
        });
      });
    });
  });
});
