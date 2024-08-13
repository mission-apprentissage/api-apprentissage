import { useMongo } from "@tests/mongo.test.utils.js";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import {
  generateCertificationFixture,
  generateKitApprentissageFixture,
  generateKitApprentissageFixtureData,
  generateSourceBcn_N_FormationDiplomeDataFixture,
  generateSourceBcn_N_FormationDiplomeFixture,
  generateSourceBcn_N_NiveauFormationDiplomeFixtureList,
  generateSourceBcn_N51_FormationDiplomeFixture,
  generateSourceBcn_V_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures/index";
import { ParisDate, parseParisLocalDate } from "shared/zod/date.primitives";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { importCertifications } from "./certifications.importer.js";

const now = new Date("2024-03-07T10:00:00Z");
const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000);
const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);

const oldestImportFc = {
  _id: new ObjectId(),
  import_date: new Date("2024-03-05T09:32:27.106Z"),
  type: "france_competence",
  archiveMeta: {
    date_publication: new Date("2021-12-24T02:00:00.000Z"),
    last_updated: new Date("2021-12-24T04:00:16.005Z"),
    nom: "export-fiches-csv-2021-12-24.zip",
    resource: {
      created_at: new Date("2021-12-24T04:00:15.762Z"),
      id: "284d7bfd-1949-46b6-bf09-cdf2fe93c53b",
      last_modified: new Date("2021-12-24T04:00:16.005Z"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/284d7bfd-1949-46b6-bf09-cdf2fe93c53b",
      title: "export-fiches-csv-2021-12-24.zip",
    },
  },
  status: "done",
} as const;

const yesterdayImports = {
  kit_apprentissage: { _id: new ObjectId(), type: "kit_apprentissage", import_date: yesterday, status: "done" },
  bcn: { _id: new ObjectId(), type: "bcn", import_date: yesterday, status: "done" },
  france_competence: {
    _id: new ObjectId(),
    type: "france_competence",
    import_date: yesterday,
    archiveMeta: {
      date_publication: new Date("2024-03-06T00:00:00Z"),
      nom: "export-fiches-csv-2024-03-06.zip",
      last_updated: new Date("2024-03-06T03:02:07.320000+00:00"),
      resource: {
        created_at: new Date("2024-03-06T03:02:02.578000+00:00"),
        id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f5",
        last_modified: new Date("2024-03-06T03:02:07.320000+00:00"),
        latest: "https://www.data.gouv.fr/fr/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f5",
        title: "export-fiches-csv-2024-03-06.zip",
      },
    },
    status: "done",
  },
} as const;

const yesterdayImportCert = {
  _id: new ObjectId(),
  type: "certifications",
  import_date: yesterday,
  source: {
    bcn: {
      import_date: yesterdayImports.bcn.import_date,
    },
    france_competence: {
      import_date: yesterdayImports.france_competence.import_date,
      nom: yesterdayImports.france_competence.archiveMeta.nom,
      oldest_date_publication: new Date("2021-12-24T02:00:00.000Z"),
    },
    kit_apprentissage: {
      import_date: yesterdayImports.kit_apprentissage.import_date,
    },
  },
} as const;

const todayImports = {
  kit_apprentissage: { _id: new ObjectId(), type: "kit_apprentissage", import_date: twoHoursAgo, status: "done" },
  bcn: { _id: new ObjectId(), type: "bcn", import_date: twoHoursAgo, status: "done" },
  france_competence: {
    _id: new ObjectId(),
    type: "france_competence",
    import_date: twoHoursAgo,
    archiveMeta: {
      date_publication: new Date("2024-03-07T00:00:00Z"),
      nom: "export-fiches-csv-2024-03-07.zip",
      last_updated: new Date("2024-03-07T03:02:07.320000+00:00"),
      resource: {
        created_at: new Date("2024-03-07T03:02:02.578000+00:00"),
        id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
        last_modified: new Date("2024-03-07T03:02:07.320000+00:00"),
        latest: "https://www.data.gouv.fr/fr/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
        title: "export-fiches-csv-2024-03-07.zip",
      },
    },
    status: "done",
  },
} as const;

const todayImportCert = {
  _id: new ObjectId(),
  type: "certifications",
  import_date: now,
  source: {
    bcn: {
      import_date: todayImports.bcn.import_date,
    },
    france_competence: {
      import_date: todayImports.france_competence.import_date,
      nom: todayImports.france_competence.archiveMeta.nom,
      oldest_date_publication: new Date("2021-12-24T02:00:00.000Z"),
    },
    kit_apprentissage: {
      import_date: todayImports.kit_apprentissage.import_date,
    },
  },
} as const;

const toDateString = (date: ParisDate | null | undefined) =>
  date ? DateTime.fromJSDate(date, { zone: "Europe/Paris" }).toFormat("dd/LL/yyyy") : null;

describe("importCertifications", () => {
  useMongo();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    return () => {
      vi.useRealTimers();
    };
  });

  describe.each([["kit_apprentissage"], ["bcn"], ["france_competence"]])(
    "when source %s import is not complete",
    (source) => {
      beforeEach(async () => {
        if (source !== "kit_apprentissage") {
          await getDbCollection("import.meta").insertOne(todayImports.kit_apprentissage);
        }
        if (source !== "bcn") {
          await getDbCollection("import.meta").insertOne(todayImports.bcn);
        }
        if (source !== "france_competence") {
          await getDbCollection("import.meta").insertMany([oldestImportFc, todayImports.france_competence]);
        }
      });

      it("should skip import", async () => {
        expect(await importCertifications()).toBe(null);
        expect(await getDbCollection("import.meta").find({ type: "certifications" }).toArray()).toEqual([]);
      });
    }
  );

  describe("when source import is complete", () => {
    beforeEach(async () => {
      await getDbCollection("import.meta").insertOne(yesterdayImports.kit_apprentissage);
      await getDbCollection("import.meta").insertOne(yesterdayImports.bcn);
      await getDbCollection("import.meta").insertMany([oldestImportFc, yesterdayImports.france_competence]);
    });

    describe("when initial import", () => {
      it("should import", async () => {
        expect(await importCertifications()).toEqual({
          total: { orphanCfd: 0, orphanRncp: 0, total: 0 },
          created: { orphanCfd: 0, orphanRncp: 0, total: 0 },
          deleted: { orphanCfd: 0, orphanRncp: 0, total: 0 },
        });
        expect(await getDbCollection("import.meta").find({ type: "certifications" }).toArray()).toEqual([
          {
            _id: expect.any(ObjectId),
            import_date: now,
            source: yesterdayImportCert.source,
            type: "certifications",
          },
        ]);
      });
    });

    describe("when import already in sync", () => {
      beforeEach(async () => {
        await getDbCollection("import.meta").insertOne(yesterdayImportCert);
      });

      describe("when force=false", () => {
        it("should skip import", async () => {
          expect(await importCertifications()).toBe(null);
          expect(await getDbCollection("import.meta").find({ type: "certifications" }).toArray()).toEqual([
            yesterdayImportCert,
          ]);
        });
      });
      describe("when force=true", () => {
        it("should import", async () => {
          expect(await importCertifications({ force: true })).toEqual({
            total: { orphanCfd: 0, orphanRncp: 0, total: 0 },
            created: { orphanCfd: 0, orphanRncp: 0, total: 0 },
            deleted: { orphanCfd: 0, orphanRncp: 0, total: 0 },
          });
          expect(await getDbCollection("import.meta").find({ type: "certifications" }).toArray()).toEqual([
            yesterdayImportCert,
            {
              _id: expect.any(ObjectId),
              import_date: now,
              source: yesterdayImportCert.source,
              type: "certifications",
            },
          ]);
        });
      });
    });

    describe("when import france_competence is pending", () => {
      beforeEach(async () => {
        await getDbCollection("import.meta").insertOne(yesterdayImportCert);
        await getDbCollection("import.meta").insertOne({ ...todayImports.france_competence, status: "pending" });
      });

      it("should skip import", async () => {
        expect(await importCertifications()).toBe(null);
        expect(await getDbCollection("import.meta").find({ type: "certifications" }).toArray()).toEqual([
          yesterdayImportCert,
        ]);
      });
    });

    describe.each<[keyof typeof todayImports]>([["kit_apprentissage"], ["bcn"], ["france_competence"]])(
      "when source %s import is updated",
      (source) => {
        beforeEach(async () => {
          await getDbCollection("import.meta").insertOne(yesterdayImportCert);
          await getDbCollection("import.meta").insertOne(todayImports[source]);
        });
        it("should import", async () => {
          expect(await importCertifications()).toEqual({
            total: { orphanCfd: 0, orphanRncp: 0, total: 0 },
            created: { orphanCfd: 0, orphanRncp: 0, total: 0 },
            deleted: { orphanCfd: 0, orphanRncp: 0, total: 0 },
          });
          expect(await getDbCollection("import.meta").find({ type: "certifications" }).toArray()).toEqual([
            yesterdayImportCert,
            {
              _id: expect.any(ObjectId),
              import_date: now,
              source: {
                bcn: source === "bcn" ? todayImportCert.source.bcn : yesterdayImportCert.source.bcn,
                france_competence:
                  source === "france_competence"
                    ? todayImportCert.source.france_competence
                    : yesterdayImportCert.source.france_competence,
                kit_apprentissage:
                  source === "kit_apprentissage"
                    ? todayImportCert.source.kit_apprentissage
                    : yesterdayImportCert.source.kit_apprentissage,
              },
              type: "certifications",
            },
          ]);
        });
      }
    );

    describe('when kit apprentissage data reference a "cfd" that does not exist', () => {
      beforeEach(async () => {
        await getDbCollection("source.kit_apprentissage").insertOne(
          generateKitApprentissageFixture({
            data: generateKitApprentissageFixtureData({
              "Code Diplôme": "36T23301",
              FicheRNCP: "RNCP1796",
            }),
          })
        );
        await getDbCollection("source.france_competence").insertOne(
          generateSourceFranceCompetenceFixture({
            numero_fiche: "RNCP1796",
          })
        );
      });

      it("should throw an error", async () => {
        await expect(importCertifications()).rejects.toThrowError(
          "import.certifications: unable to importCertifications"
        );
      });
    });

    describe('when kit apprentissage data reference a "rncp" that does not exist', () => {
      beforeEach(async () => {
        await getDbCollection("source.kit_apprentissage").insertOne(
          generateKitApprentissageFixture({
            data: generateKitApprentissageFixtureData({
              "Code Diplôme": "36T23301",
              FicheRNCP: "RNCP1796",
            }),
          })
        );
        await getDbCollection("source.bcn").insertOne(
          generateSourceBcn_N_FormationDiplomeFixture({
            data: { FORMATION_DIPLOME: "36T23301" },
          })
        );
      });

      it("should throw an error", async () => {
        await expect(importCertifications()).rejects.toThrowError(
          "import.certifications: unable to importCertifications"
        );
      });
    });
  });

  describe("when source are not in sync with certifications", () => {
    // Use fix validity interval to not be polluted by the continuity tests
    const debut = { value: "01/01/2023", date: parseParisLocalDate("01/01/2023", "00:00:00") };
    const fin = { value: "31/12/2023", date: parseParisLocalDate("31/12/2023", "23:59:59") };

    const periode_validite = {
      debut: debut.date,
      fin: fin.date,
      cfd: { ouverture: debut.date, fermeture: fin.date },
      zRncp: { activation: debut.date, fin_enregistrement: fin.date },
    };

    const existingCertifications = {
      updated: [
        generateCertificationFixture({
          _id: new ObjectId(),
          identifiant: { cfd: "20512008", rncp: "RNCP24420", rncp_anterieur_2019: true },
          periode_validite,
          created_at: yesterday,
          updated_at: yesterday,
        }),
        generateCertificationFixture({
          _id: new ObjectId(),
          identifiant: { cfd: "70010004", rncp: null, rncp_anterieur_2019: null },
          periode_validite,
          created_at: yesterday,
          updated_at: yesterday,
        }),
        generateCertificationFixture({
          _id: new ObjectId(),
          identifiant: { cfd: null, rncp: "RNCP987", rncp_anterieur_2019: true },
          periode_validite,
          created_at: yesterday,
          updated_at: yesterday,
        }),
      ],
      removed: [
        generateCertificationFixture({
          _id: new ObjectId(),
          identifiant: { cfd: "56T25202", rncp: "RNCP37545" },
          periode_validite,
          created_at: yesterday,
          updated_at: yesterday,
        }),
        generateCertificationFixture({
          _id: new ObjectId(),
          identifiant: { cfd: "56X23201", rncp: null },
          periode_validite,
          created_at: yesterday,
          updated_at: yesterday,
        }),
        generateCertificationFixture({
          _id: new ObjectId(),
          identifiant: { cfd: null, rncp: "RNCP183" },
          periode_validite,
          created_at: yesterday,
          updated_at: yesterday,
        }),
      ],
    };

    const newCertifications = [
      generateCertificationFixture({
        _id: new ObjectId(),
        identifiant: { cfd: "56T25106", rncp: "RNCP34148", rncp_anterieur_2019: false },
        periode_validite,
        created_at: now,
        updated_at: now,
      }),
      generateCertificationFixture({
        _id: new ObjectId(),
        identifiant: { cfd: "97031104", rncp: null, rncp_anterieur_2019: null },
        periode_validite,
        created_at: now,
        updated_at: now,
      }),
      generateCertificationFixture({
        _id: new ObjectId(),
        identifiant: { cfd: null, rncp: "RNCP14636", rncp_anterieur_2019: true },
        periode_validite,
        created_at: now,
        updated_at: now,
      }),
    ];

    const kitApprentissageData = [
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": existingCertifications.updated[0].identifiant.cfd!,
          FicheRNCP: existingCertifications.updated[0].identifiant.rncp!,
        }),
      }),
      generateKitApprentissageFixture({
        // Couple updated
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": existingCertifications.removed[1].identifiant.cfd!,
          FicheRNCP: existingCertifications.removed[2].identifiant.rncp!,
        }),
      }),
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": newCertifications[0].identifiant.cfd!,
          FicheRNCP: newCertifications[0].identifiant.rncp!,
        }),
      }),
    ];

    const bcnData = [
      generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: existingCertifications.updated[0].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_N_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: existingCertifications.updated[0].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: existingCertifications.updated[1].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_N51_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: existingCertifications.updated[1].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: existingCertifications.removed[1].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_N_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: existingCertifications.removed[1].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: newCertifications[0].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_N_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: newCertifications[0].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: newCertifications[1].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_N51_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: newCertifications[1].identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      ...generateSourceBcn_N_NiveauFormationDiplomeFixtureList(),
    ];

    const common = { date_premiere_activation: debut.date, data: { standard: { Date_Fin_Enregistrement: fin.value } } };

    const franceCompetenceData = [
      generateSourceFranceCompetenceFixture({
        numero_fiche: existingCertifications.updated[0].identifiant.rncp ?? "",
        ...common,
      }),
      generateSourceFranceCompetenceFixture({
        numero_fiche: existingCertifications.updated[2].identifiant.rncp ?? "",
        ...common,
      }),
      generateSourceFranceCompetenceFixture({
        numero_fiche: existingCertifications.removed[2].identifiant.rncp ?? "",
        ...common,
      }),
      generateSourceFranceCompetenceFixture({ numero_fiche: newCertifications[0].identifiant.rncp ?? "", ...common }),
      generateSourceFranceCompetenceFixture({ numero_fiche: newCertifications[2].identifiant.rncp ?? "", ...common }),
    ];

    beforeEach(async () => {
      await Promise.all([
        getDbCollection("certifications").insertMany([
          ...existingCertifications.updated,
          ...existingCertifications.removed,
        ]),
        getDbCollection("source.bcn").insertMany(bcnData),
        getDbCollection("source.france_competence").insertMany(franceCompetenceData),
        getDbCollection("source.kit_apprentissage").insertMany(kitApprentissageData),
        getDbCollection("import.meta").insertOne(oldestImportFc),
        getDbCollection("import.meta").insertOne(yesterdayImportCert),
        getDbCollection("import.meta").insertOne(todayImports.kit_apprentissage),
        getDbCollection("import.meta").insertOne(todayImports.bcn),
        getDbCollection("import.meta").insertOne(todayImports.france_competence),
      ]);
    });

    it("should import certifications", async () => {
      expect(await importCertifications()).toEqual({
        total: { orphanCfd: 2, orphanRncp: 2, total: 7 },
        created: { orphanCfd: 1, orphanRncp: 1, total: 4 },
        deleted: { orphanCfd: 1, orphanRncp: 1, total: 3 },
      });
      expect(await getDbCollection("import.meta").find({ type: "certifications" }).toArray()).toEqual([
        yesterdayImportCert,
        {
          _id: expect.any(ObjectId),
          import_date: now,
          source: {
            bcn: todayImportCert.source.bcn,
            france_competence: todayImportCert.source.france_competence,
            kit_apprentissage: todayImportCert.source.kit_apprentissage,
          },
          type: "certifications",
        },
      ]);

      // Ignore all fields, they will be tests individually
      expect(
        await getDbCollection("certifications")
          .find(
            {},
            {
              projection: { _id: 0, identifiant: 1, created_at: 1, updated_at: 1 },
              sort: { "identifiant.cfd": 1, "identifiant.rncp": 1 },
            }
          )
          .toArray()
      ).toEqual(
        [
          ...existingCertifications.updated.map((c) => ({
            identifiant: c.identifiant,
            created_at: c.created_at,
            updated_at: now,
          })),
          {
            identifiant: {
              cfd: existingCertifications.removed[1].identifiant.cfd,
              rncp: existingCertifications.removed[2].identifiant.rncp,
              rncp_anterieur_2019: existingCertifications.removed[2].identifiant.rncp_anterieur_2019,
            },
            created_at: now,
            updated_at: now,
          },
          ...newCertifications.map((c) => ({ identifiant: c.identifiant, created_at: now, updated_at: now })),
        ].toSorted((a, b) => {
          return (
            (a.identifiant.cfd ?? "").localeCompare(b.identifiant.cfd ?? "") ||
            (a.identifiant.rncp ?? "").localeCompare(b.identifiant.rncp ?? "")
          );
        })
      );
    });
  });

  describe("when existing rncp_anterieur_2019 is invalid", () => {
    // Use fix validity interval to not be polluted by the continuity tests
    const debut = { value: "01/01/2023", date: parseParisLocalDate("01/01/2023", "00:00:00") };
    const fin = { value: "31/12/2023", date: parseParisLocalDate("31/12/2023", "23:59:59") };

    const periode_validite = {
      debut: debut.date,
      fin: fin.date,
      cfd: { ouverture: debut.date, fermeture: fin.date },
      zRncp: { activation: debut.date, fin_enregistrement: fin.date },
    };

    const existingCertification = generateCertificationFixture({
      _id: new ObjectId(),
      identifiant: { cfd: "20512008", rncp: "RNCP24420", rncp_anterieur_2019: false },
      periode_validite,
      created_at: yesterday,
      updated_at: yesterday,
    });

    const kitApprentissageData = [
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": existingCertification.identifiant.cfd!,
          FicheRNCP: existingCertification.identifiant.rncp!,
        }),
      }),
    ];

    const bcnData = [
      generateSourceBcn_V_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: existingCertification.identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        },
      }),
      generateSourceBcn_N_FormationDiplomeFixture({
        data: generateSourceBcn_N_FormationDiplomeDataFixture({
          FORMATION_DIPLOME: existingCertification.identifiant.cfd!,
          DATE_OUVERTURE: debut.value,
          DATE_FERMETURE: fin.value,
        }),
      }),
      ...generateSourceBcn_N_NiveauFormationDiplomeFixtureList(),
    ];

    const franceCompetenceData = [
      generateSourceFranceCompetenceFixture({
        numero_fiche: existingCertification.identifiant.rncp ?? "",
        date_premiere_activation: debut.date,
        data: { standard: { Date_Fin_Enregistrement: fin.value } },
      }),
    ];

    beforeEach(async () => {
      await Promise.all([
        getDbCollection("certifications").insertOne(existingCertification),
        getDbCollection("source.bcn").insertMany(bcnData),
        getDbCollection("source.france_competence").insertMany(franceCompetenceData),
        getDbCollection("source.kit_apprentissage").insertMany(kitApprentissageData),
        getDbCollection("import.meta").insertOne(oldestImportFc),
        getDbCollection("import.meta").insertOne(yesterdayImportCert),
        getDbCollection("import.meta").insertOne(todayImports.kit_apprentissage),
        getDbCollection("import.meta").insertOne(todayImports.bcn),
        getDbCollection("import.meta").insertOne(todayImports.france_competence),
      ]);
    });

    it("should update rncp_", async () => {
      expect(await importCertifications()).toEqual({
        total: { orphanCfd: 0, orphanRncp: 0, total: 1 },
        created: { orphanCfd: 0, orphanRncp: 0, total: 0 },
        deleted: { orphanCfd: 0, orphanRncp: 0, total: 0 },
      });
      expect(await getDbCollection("import.meta").find({ type: "certifications" }).toArray()).toEqual([
        yesterdayImportCert,
        {
          _id: expect.any(ObjectId),
          import_date: now,
          source: {
            bcn: todayImportCert.source.bcn,
            france_competence: todayImportCert.source.france_competence,
            kit_apprentissage: todayImportCert.source.kit_apprentissage,
          },
          type: "certifications",
        },
      ]);

      // Ignore all fields, they will be tests individually
      expect(
        await getDbCollection("certifications")
          .find(
            {},
            {
              projection: { _id: 0, identifiant: 1, updated_at: 1 },
              sort: { "identifiant.cfd": 1, "identifiant.rncp": 1 },
            }
          )
          .toArray()
      ).toEqual([
        {
          identifiant: {
            ...existingCertification.identifiant,
            rncp_anterieur_2019: true,
          },
          updated_at: now,
        },
      ]);
    });
  });

  describe("with continuity", () => {
    const searchmap = {
      rncp: {
        RNCP00100: {
          activation: parseParisLocalDate("01/01/2019", "00:00:00"),
          fin_enregistrement: parseParisLocalDate("31/12/2019", "23:59:59"),
          nouvelles: ["RNCP00101"],
          anciennes: [],
        },
        RNCP00101: {
          activation: parseParisLocalDate("01/01/2020", "00:00:00"),
          fin_enregistrement: parseParisLocalDate("31/12/2021", "23:59:59"),
          nouvelles: ["RNCP00102", "RNCP00103"],
          anciennes: ["RNCP00100"],
        },
        RNCP00102: {
          activation: parseParisLocalDate("01/01/2020", "00:00:00"),
          fin_enregistrement: parseParisLocalDate("31/12/2025", "23:59:59"),
          nouvelles: [],
          anciennes: ["RNCP00101"],
        },
        RNCP00103: {
          activation: parseParisLocalDate("01/01/2020", "00:00:00"),
          fin_enregistrement: parseParisLocalDate("31/12/2025", "23:59:59"),
          nouvelles: [],
          anciennes: ["RNCP00101"],
        },

        RNCP00200: {
          activation: parseParisLocalDate("01/01/2019", "00:00:00"),
          fin_enregistrement: parseParisLocalDate("31/12/2023", "23:59:59"),
          nouvelles: [],
          anciennes: [],
        },

        RNCP00300: {
          activation: parseParisLocalDate("01/01/2019", "00:00:00"),
          fin_enregistrement: null,
          nouvelles: ["RNCP00301"],
          anciennes: [],
        },
        RNCP00301: {
          activation: null,
          fin_enregistrement: parseParisLocalDate("31/12/2023", "23:59:59"),
          nouvelles: [],
          anciennes: ["RNCP00300"],
        },
      },

      cfd: {
        10000001: {
          ouverture: null,
          fermeture: parseParisLocalDate("31/12/2019", "23:59:59"),
          nouvelles: ["10000002"],
          anciennes: [],
        },
        10000002: {
          ouverture: parseParisLocalDate("01/01/2019", "00:00:00"),
          fermeture: parseParisLocalDate("31/12/2025", "23:59:59"),
          nouvelles: [],
          anciennes: ["10000001"],
        },

        20000001: {
          ouverture: parseParisLocalDate("01/01/2019", "00:00:00"),
          fermeture: parseParisLocalDate("31/12/2023", "23:59:59"),
          nouvelles: [],
          anciennes: [],
        },

        30000001: {
          ouverture: parseParisLocalDate("01/01/2019", "00:00:00"),
          fermeture: null,
          nouvelles: ["30000002"],
          anciennes: [],
        },
        30000002: {
          ouverture: parseParisLocalDate("01/01/2022", "00:00:00"),
          fermeture: parseParisLocalDate("31/12/2023", "23:59:59"),
          nouvelles: [],
          anciennes: ["30000001"],
        },
      },
    } as const;

    const kitApprentissageData = [
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": "10000001",
          FicheRNCP: "RNCP00100",
        }),
      }),
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": "10000002",
          FicheRNCP: "RNCP00102",
        }),
      }),
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": "20000001",
          FicheRNCP: "RNCP00200",
        }),
      }),
    ];

    const generateBcnData = (code: keyof (typeof searchmap)["cfd"]) => {
      return [
        generateSourceBcn_V_FormationDiplomeFixture({
          data: {
            FORMATION_DIPLOME: `${code}`,
            DATE_OUVERTURE: toDateString(searchmap.cfd[code]?.ouverture),
            DATE_FERMETURE: toDateString(searchmap.cfd[code]?.fermeture),
          },
        }),
        generateSourceBcn_N_FormationDiplomeFixture({
          data: {
            FORMATION_DIPLOME: `${code}`,
            DATE_OUVERTURE: toDateString(searchmap.cfd[code]?.ouverture),
            DATE_FERMETURE: toDateString(searchmap.cfd[code]?.fermeture),
            ANCIEN_DIPLOMES: [...searchmap.cfd[code].anciennes],
            NOUVEAU_DIPLOMES: [...searchmap.cfd[code].nouvelles],
          },
        }),
      ];
    };

    const bcnData = [
      ...generateBcnData(10000001),
      ...generateBcnData(10000002),
      ...generateBcnData(20000001),
      ...generateBcnData(30000001),
      ...generateBcnData(30000002),
      ...generateSourceBcn_N_NiveauFormationDiplomeFixtureList(),
    ];

    const generateFcData = (code: keyof (typeof searchmap)["rncp"]) => {
      return generateSourceFranceCompetenceFixture({
        numero_fiche: code,
        date_premiere_activation: searchmap.rncp[code]?.activation,
        data: {
          standard: {
            Date_Fin_Enregistrement: toDateString(searchmap.rncp[code]?.fin_enregistrement),
          },
          ancienne_nouvelle_certification: [
            ...searchmap.rncp[code].anciennes.map((ancienne) => ({
              Numero_Fiche: code,
              Ancienne_Certification: ancienne,
              Nouvelle_Certification: null,
            })),
            ...searchmap.rncp[code].nouvelles.map((nouvelle) => ({
              Numero_Fiche: code,
              Ancienne_Certification: null,
              Nouvelle_Certification: nouvelle,
            })),
          ],
        },
      });
    };

    const franceCompetenceData = [
      generateFcData("RNCP00100"),
      generateFcData("RNCP00101"),
      generateFcData("RNCP00102"),
      generateFcData("RNCP00103"),
      generateFcData("RNCP00200"),
      generateFcData("RNCP00300"),
      generateFcData("RNCP00301"),
    ];

    beforeEach(async () => {
      await Promise.all([
        getDbCollection("source.bcn").insertMany(bcnData),
        getDbCollection("source.france_competence").insertMany(franceCompetenceData),
        getDbCollection("source.kit_apprentissage").insertMany(kitApprentissageData),
        getDbCollection("import.meta").insertOne({
          _id: new ObjectId(),
          import_date: new Date("2024-03-05T09:32:27.106Z"),
          type: "france_competence",
          archiveMeta: {
            date_publication: new Date("2015-12-24T02:00:00.000Z"),
            last_updated: new Date("2021-12-24T04:00:16.005Z"),
            nom: "export-fiches-csv-2021-12-24.zip",
            resource: {
              created_at: new Date("2021-12-24T04:00:15.762Z"),
              id: "284d7bfd-1949-46b6-bf09-cdf2fe93c53b",
              last_modified: new Date("2021-12-24T04:00:16.005Z"),
              latest: "https://www.data.gouv.fr/fr/datasets/r/284d7bfd-1949-46b6-bf09-cdf2fe93c53b",
              title: "export-fiches-csv-2021-12-24.zip",
            },
          },
          status: "done",
        }),
        getDbCollection("import.meta").insertOne(todayImports.kit_apprentissage),
        getDbCollection("import.meta").insertOne(todayImports.bcn),
        getDbCollection("import.meta").insertOne(todayImports.france_competence),
      ]);
    });

    it("should import certifications", async () => {
      expect(await importCertifications()).toEqual({
        total: { orphanCfd: 4, orphanRncp: 4, total: 11 },
        created: { orphanCfd: 4, orphanRncp: 4, total: 11 },
        deleted: { orphanCfd: 0, orphanRncp: 0, total: 0 },
      });
      // Ignore all fields, they will be tests individually
      expect(
        await getDbCollection("certifications")
          .find(
            {},
            {
              projection: { _id: 0, identifiant: 1, continuite: 1 },
              sort: { "identifiant.cfd": 1, "identifiant.rncp": 1 },
            }
          )
          .toArray()
      ).toMatchSnapshot();
    });
  });

  describe("with partial kit_coverage", () => {
    const searchmap = {
      rncp: {
        RNCP00100: {
          activation: parseParisLocalDate("01/01/2019", "00:00:00"),
          fin_enregistrement: parseParisLocalDate("31/12/2019", "23:59:59"),
        },
        RNCP00101: {
          activation: parseParisLocalDate("01/01/2021", "00:00:00"),
          fin_enregistrement: parseParisLocalDate("31/12/2021", "23:59:59"),
        },

        RNCP00200: {
          activation: null,
          fin_enregistrement: parseParisLocalDate("31/12/2021", "23:59:59"),
        },
        RNCP00201: {
          activation: parseParisLocalDate("01/01/2022", "00:00:00"),
          fin_enregistrement: null,
        },

        RNCP00300: {
          activation: parseParisLocalDate("01/01/2019", "00:00:00"),
          fin_enregistrement: null,
        },
      },

      cfd: {
        10000001: {
          ouverture: null,
          fermeture: parseParisLocalDate("31/12/2022", "23:59:59"),
        },

        20000001: {
          ouverture: parseParisLocalDate("01/01/2017", "00:00:00"),
          fermeture: parseParisLocalDate("31/12/2020", "23:59:59"),
        },

        30000001: {
          ouverture: null,
          fermeture: parseParisLocalDate("01/01/2022", "23:59:59"),
        },
      },
    } as const;

    const kitApprentissageData = [
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": "10000001",
          FicheRNCP: "RNCP00100",
        }),
      }),
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": "10000001",
          FicheRNCP: "RNCP00101",
        }),
      }),
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": "20000001",
          FicheRNCP: "RNCP00200",
        }),
      }),
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": "20000001",
          FicheRNCP: "RNCP00201",
        }),
      }),
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": "30000001",
          FicheRNCP: "RNCP00300",
        }),
      }),
    ];

    const generateBcnData = (code: keyof (typeof searchmap)["cfd"]) => {
      return [
        generateSourceBcn_V_FormationDiplomeFixture({
          data: {
            FORMATION_DIPLOME: `${code}`,
            DATE_OUVERTURE: toDateString(searchmap.cfd[code]?.ouverture),
            DATE_FERMETURE: toDateString(searchmap.cfd[code]?.fermeture),
          },
        }),
        generateSourceBcn_N_FormationDiplomeFixture({
          data: {
            FORMATION_DIPLOME: `${code}`,
            DATE_OUVERTURE: toDateString(searchmap.cfd[code]?.ouverture),
            DATE_FERMETURE: toDateString(searchmap.cfd[code]?.fermeture),
          },
        }),
      ];
    };

    const bcnData = [
      ...generateBcnData(10000001),
      ...generateBcnData(20000001),
      ...generateBcnData(30000001),
      ...generateSourceBcn_N_NiveauFormationDiplomeFixtureList(),
    ];

    const generateFcData = (code: keyof (typeof searchmap)["rncp"]) => {
      return generateSourceFranceCompetenceFixture({
        numero_fiche: code,
        date_premiere_activation: searchmap.rncp[code]?.activation,
        data: {
          standard: {
            Date_Fin_Enregistrement: toDateString(searchmap.rncp[code]?.fin_enregistrement),
          },
        },
      });
    };

    const franceCompetenceData = [
      generateFcData("RNCP00100"),
      generateFcData("RNCP00101"),
      generateFcData("RNCP00200"),
      generateFcData("RNCP00201"),
      generateFcData("RNCP00300"),
    ];

    beforeEach(async () => {
      await Promise.all([
        getDbCollection("source.bcn").insertMany(bcnData),
        getDbCollection("source.france_competence").insertMany(franceCompetenceData),
        getDbCollection("source.kit_apprentissage").insertMany(kitApprentissageData),
        getDbCollection("import.meta").insertOne({
          _id: new ObjectId(),
          import_date: new Date("2024-03-05T09:32:27.106Z"),
          type: "france_competence",
          archiveMeta: {
            date_publication: new Date("2015-12-24T02:00:00.000Z"),
            last_updated: new Date("2021-12-24T04:00:16.005Z"),
            nom: "export-fiches-csv-2021-12-24.zip",
            resource: {
              created_at: new Date("2021-12-24T04:00:15.762Z"),
              id: "284d7bfd-1949-46b6-bf09-cdf2fe93c53b",
              last_modified: new Date("2021-12-24T04:00:16.005Z"),
              latest: "https://www.data.gouv.fr/fr/datasets/r/284d7bfd-1949-46b6-bf09-cdf2fe93c53b",
              title: "export-fiches-csv-2021-12-24.zip",
            },
          },
          status: "done",
        }),
        getDbCollection("import.meta").insertOne(todayImports.kit_apprentissage),
        getDbCollection("import.meta").insertOne(todayImports.bcn),
        getDbCollection("import.meta").insertOne(todayImports.france_competence),
      ]);
    });

    it("should import certifications", async () => {
      expect(await importCertifications()).toEqual({
        total: { orphanCfd: 4, orphanRncp: 4, total: 13 },
        created: { orphanCfd: 4, orphanRncp: 4, total: 13 },
        deleted: { orphanCfd: 0, orphanRncp: 0, total: 0 },
      });
      // Ignore all fields, they will be tests individually
      expect(
        await getDbCollection("certifications")
          .find(
            {},
            {
              projection: { _id: 0, identifiant: 1, periode_validite: 1 },
              sort: { "identifiant.cfd": 1, "identifiant.rncp": 1, "periode_validite.debut": 1 },
            }
          )
          .toArray()
      ).toMatchSnapshot();
    });
  });
});
