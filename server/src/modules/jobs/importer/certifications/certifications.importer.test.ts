import { useMongo } from "@tests/utils/mongo.utils";
import { ObjectId } from "mongodb";
import {
  generateCertificationFixture,
  generateKitApprentissageFixture,
  generateKitApprentissageFixtureData,
  generateSourceBcn_N_FormationDiplomeDataFixture,
  generateSourceBcn_N_FormationDiplomeFixture,
  generateSourceBcn_N51_FormationDiplomeDataFixture,
  generateSourceBcn_N51_FormationDiplomeFixture,
  generateSourceBcn_V_FormationDiplomeDataFixture,
  generateSourceBcn_V_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDbCollection } from "../../../../common/utils/mongodbUtils";
import { importCertifications } from "./certifications.importer";

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
} as const;

const yesterdayImports = {
  kit_apprentissage: { _id: new ObjectId(), type: "kit_apprentissage", import_date: yesterday },
  bcn: { _id: new ObjectId(), type: "bcn", import_date: yesterday },
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
  kit_apprentissage: { _id: new ObjectId(), type: "kit_apprentissage", import_date: twoHoursAgo },
  bcn: { _id: new ObjectId(), type: "bcn", import_date: twoHoursAgo },
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
          generateSourceBcn_V_FormationDiplomeFixture({
            data: generateSourceBcn_V_FormationDiplomeDataFixture({ FORMATION_DIPLOME: "36T23301" }),
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
    const existingCertifications = {
      updated: [
        generateCertificationFixture({
          _id: new ObjectId(),
          code: { cfd: "20512008", rncp: "RNCP24420" },
          created_at: yesterday,
          updated_at: yesterday,
        }),
        generateCertificationFixture({
          _id: new ObjectId(),
          code: { cfd: "70010004", rncp: null },
          created_at: yesterday,
          updated_at: yesterday,
        }),
        generateCertificationFixture({
          _id: new ObjectId(),
          code: { cfd: null, rncp: "RNCP987" },
          created_at: yesterday,
          updated_at: yesterday,
        }),
      ],
      removed: [
        generateCertificationFixture({
          _id: new ObjectId(),
          code: { cfd: "56T25202", rncp: "RNCP37545" },
          created_at: yesterday,
          updated_at: yesterday,
        }),
        generateCertificationFixture({
          _id: new ObjectId(),
          code: { cfd: "56X23201", rncp: null },
          created_at: yesterday,
          updated_at: yesterday,
        }),
        generateCertificationFixture({
          _id: new ObjectId(),
          code: { cfd: null, rncp: "RNCP183" },
          created_at: yesterday,
          updated_at: yesterday,
        }),
      ],
    };

    const newCertifications = [
      generateCertificationFixture({
        _id: new ObjectId(),
        code: { cfd: "56T25106", rncp: "RNCP34148" },
        created_at: now,
        updated_at: now,
      }),
      generateCertificationFixture({
        _id: new ObjectId(),
        code: { cfd: "97031104", rncp: null },
        created_at: now,
        updated_at: now,
      }),
      generateCertificationFixture({
        _id: new ObjectId(),
        code: { cfd: null, rncp: "RNCP14636" },
        created_at: now,
        updated_at: now,
      }),
    ];

    const kitApprentissageData = [
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": existingCertifications.updated[0].code.cfd,
          FicheRNCP: existingCertifications.updated[0].code.rncp,
        }),
      }),
      generateKitApprentissageFixture({
        // Couple updated
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": existingCertifications.removed[1].code.cfd,
          FicheRNCP: existingCertifications.removed[2].code.rncp,
        }),
      }),
      generateKitApprentissageFixture({
        data: generateKitApprentissageFixtureData({
          "Code Diplôme": newCertifications[0].code.cfd,
          FicheRNCP: newCertifications[0].code.rncp,
        }),
      }),
    ];

    const bcnData = [
      generateSourceBcn_V_FormationDiplomeFixture({
        data: generateSourceBcn_V_FormationDiplomeDataFixture({
          FORMATION_DIPLOME: existingCertifications.updated[0].code.cfd,
        }),
      }),
      generateSourceBcn_N_FormationDiplomeFixture({
        data: generateSourceBcn_N_FormationDiplomeDataFixture({
          FORMATION_DIPLOME: existingCertifications.updated[0].code.cfd,
        }),
      }),
      generateSourceBcn_V_FormationDiplomeFixture({
        data: generateSourceBcn_V_FormationDiplomeDataFixture({
          FORMATION_DIPLOME: existingCertifications.updated[1].code.cfd,
        }),
      }),
      generateSourceBcn_N51_FormationDiplomeFixture({
        data: generateSourceBcn_N51_FormationDiplomeDataFixture({
          FORMATION_DIPLOME: existingCertifications.updated[1].code.cfd,
        }),
      }),
      generateSourceBcn_V_FormationDiplomeFixture({
        data: generateSourceBcn_V_FormationDiplomeDataFixture({
          FORMATION_DIPLOME: existingCertifications.removed[1].code.cfd,
        }),
      }),
      generateSourceBcn_N_FormationDiplomeFixture({
        data: generateSourceBcn_N_FormationDiplomeDataFixture({
          FORMATION_DIPLOME: existingCertifications.removed[1].code.cfd,
        }),
      }),
      generateSourceBcn_V_FormationDiplomeFixture({
        data: generateSourceBcn_V_FormationDiplomeDataFixture({ FORMATION_DIPLOME: newCertifications[0].code.cfd }),
      }),
      generateSourceBcn_N_FormationDiplomeFixture({
        data: generateSourceBcn_N_FormationDiplomeDataFixture({ FORMATION_DIPLOME: newCertifications[0].code.cfd }),
      }),
      generateSourceBcn_V_FormationDiplomeFixture({
        data: generateSourceBcn_V_FormationDiplomeDataFixture({ FORMATION_DIPLOME: newCertifications[1].code.cfd }),
      }),
      generateSourceBcn_N51_FormationDiplomeFixture({
        data: generateSourceBcn_N51_FormationDiplomeDataFixture({ FORMATION_DIPLOME: newCertifications[1].code.cfd }),
      }),
    ];

    const franceCompetenceData = [
      generateSourceFranceCompetenceFixture({ numero_fiche: existingCertifications.updated[0].code.rncp ?? "" }),
      generateSourceFranceCompetenceFixture({ numero_fiche: existingCertifications.updated[2].code.rncp ?? "" }),
      generateSourceFranceCompetenceFixture({ numero_fiche: existingCertifications.removed[2].code.rncp ?? "" }),
      generateSourceFranceCompetenceFixture({ numero_fiche: newCertifications[0].code.rncp ?? "" }),
      generateSourceFranceCompetenceFixture({ numero_fiche: newCertifications[2].code.rncp ?? "" }),
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
      ]).catch(console.error);
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
            { projection: { _id: 0, code: 1, created_at: 1, updated_at: 1 }, sort: { "code.cfd": 1, "code.rncp": 1 } }
          )
          .toArray()
      ).toEqual(
        [
          ...existingCertifications.updated.map((c) => ({ code: c.code, created_at: c.created_at, updated_at: now })),
          {
            code: {
              cfd: existingCertifications.removed[1].code.cfd,
              rncp: existingCertifications.removed[2].code.rncp,
            },
            created_at: now,
            updated_at: now,
          },
          ...newCertifications.map((c) => ({ code: c.code, created_at: now, updated_at: now })),
        ].toSorted((a, b) => {
          return (
            (a.code.cfd ?? "").localeCompare(b.code.cfd ?? "") || (a.code.rncp ?? "").localeCompare(b.code.rncp ?? "")
          );
        })
      );
    });
  });
});
