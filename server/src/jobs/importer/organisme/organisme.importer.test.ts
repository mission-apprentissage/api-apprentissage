import { ObjectId } from "mongodb";
import { generateOrganismeReferentielFixture } from "shared/models/fixtures/index";
import type { IOrganismeInternal } from "shared/models/organisme.model";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  communesFixture,
  etablissementNotFoundSiret,
  etablissementsFixture,
  expectedOrganismes,
  sourceReferentielFixtures,
  uniteLegaleFixture,
} from "./organisme.importer.fixtures.js";
import { importOrganismes } from "./organisme.importer.js";
import { getEtablissementDiffusible, getUniteLegaleDiffusible } from "@/services/apis/entreprise/entreprise.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { useMongo } from "@tests/mongo.test.utils.js";

vi.mock("@/services/apis/entreprise/entreprise.js", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual: any = await importOriginal();
  return {
    ...actual,
    getEtablissementDiffusible: vi.fn(),
    getUniteLegaleDiffusible: vi.fn(),
  };
});

const now = new Date("2024-03-07T10:00:00Z");
const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000);
const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);

const yesterdayImports = {
  referentiel: { _id: new ObjectId(), type: "referentiel", import_date: yesterday, status: "done" },
  communes: { _id: new ObjectId(), type: "communes", import_date: yesterday, status: "done" },
} as const;

const yesterdayImportOrganismes = {
  _id: new ObjectId(),
  type: "organismes",
  import_date: yesterday,
  source: {
    referentiel: {
      import_date: yesterdayImports.referentiel.import_date,
    },
    communes: {
      import_date: yesterdayImports.communes.import_date,
    },
  },
  status: "done",
} as const;

const todayImports = {
  referentiel: { _id: new ObjectId(), type: "referentiel", import_date: twoHoursAgo, status: "done" },
  communes: { _id: new ObjectId(), type: "communes", import_date: twoHoursAgo, status: "done" },
} as const;

const todayImportOrganismes = {
  _id: new ObjectId(),
  type: "certifications",
  import_date: now,
  source: {
    referentiel: {
      import_date: todayImports.referentiel.import_date,
    },
    communes: {
      import_date: todayImports.communes.import_date,
    },
  },
} as const;

describe("importOrganismes", () => {
  useMongo();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    return () => {
      vi.useRealTimers();
    };
  });

  describe.each([["referentiel"], ["communes"]])("when source %s import is not complete", (source) => {
    beforeEach(async () => {
      if (source !== "referentiel") {
        await getDbCollection("import.meta").insertOne(todayImports.referentiel);
      }
      if (source !== "communes") {
        await getDbCollection("import.meta").insertOne(todayImports.communes);
      }
    });

    it("should skip import", async () => {
      expect(await importOrganismes()).toBe(null);
      expect(await getDbCollection("import.meta").find({ type: "organismes" }).toArray()).toEqual([]);
    });
  });

  describe("when source import is complete", () => {
    beforeEach(async () => {
      await getDbCollection("import.meta").insertOne(yesterdayImports.referentiel);
      await getDbCollection("import.meta").insertOne(yesterdayImports.communes);

      await getDbCollection("source.referentiel").insertMany(
        sourceReferentielFixtures.map((data) => ({
          data,
          date: yesterdayImports.referentiel.import_date,
          _id: new ObjectId(),
        }))
      );
      await getDbCollection("commune").insertMany(communesFixture);
      vi.mocked(getEtablissementDiffusible).mockImplementation(async (siret: string) => {
        return etablissementsFixture.find((e) => e.siret === siret) ?? null;
      });
      vi.mocked(getUniteLegaleDiffusible).mockImplementation(async (siren: string) => {
        return uniteLegaleFixture.find((e) => e.siren === siren) ?? null;
      });
    });

    it("should import", async () => {
      expect(await importOrganismes()).toBe(null);
      expect(await getDbCollection("import.meta").find({ type: "organismes" }).toArray()).toEqual([
        {
          _id: expect.any(ObjectId),
          import_date: now,
          source: yesterdayImportOrganismes.source,
          type: "organismes",
          status: "done",
        },
      ]);
      expect(
        await getDbCollection("organisme")
          .find({}, { projection: { _id: 0 } })
          .toArray()
      ).toEqual(
        expectedOrganismes.map((o) => ({
          ...o,
          created_at: now,
          updated_at: now,
        }))
      );
    });

    describe("when import already in sync", () => {
      beforeEach(async () => {
        await getDbCollection("import.meta").insertOne(yesterdayImportOrganismes);
      });

      it("should skip import", async () => {
        expect(await importOrganismes()).toBe(null);
        expect(await getDbCollection("import.meta").find({ type: "organismes" }).toArray()).toEqual([
          yesterdayImportOrganismes,
        ]);
        expect(
          await getDbCollection("organisme")
            .find({}, { projection: { _id: 0 } })
            .toArray()
        ).toEqual([]);
      });
    });

    describe("when previous import failed", () => {
      beforeEach(async () => {
        await getDbCollection("import.meta").insertOne({ ...yesterdayImportOrganismes, status: "failed" });
      });

      it("should import", async () => {
        expect(await importOrganismes()).toEqual(null);
        expect(
          await getDbCollection("import.meta")
            .find({ type: "organismes" }, { sort: { import_date: 1 } })
            .toArray()
        ).toEqual([
          { ...yesterdayImportOrganismes, status: "failed" },
          {
            _id: expect.any(ObjectId),
            import_date: now,
            source: yesterdayImportOrganismes.source,
            type: "organismes",
            status: "done",
          },
        ]);
        expect(
          await getDbCollection("organisme")
            .find({}, { projection: { _id: 0 } })
            .toArray()
        ).toEqual(
          expectedOrganismes.map((o) => ({
            ...o,
            created_at: now,
            updated_at: now,
          }))
        );
      });
    });

    describe.each<[keyof typeof todayImports]>([["referentiel"], ["communes"]])(
      "when source %s import is updated",
      (source) => {
        beforeEach(async () => {
          await getDbCollection("import.meta").insertOne(yesterdayImportOrganismes);
          await getDbCollection("import.meta").insertOne(todayImports[source]);

          if (source === "referentiel") {
            // Last import has updated all source documents
            await getDbCollection("source.referentiel").updateMany({}, { $set: { date: twoHoursAgo } });
          }
        });
        it("should import", async () => {
          expect(await importOrganismes()).toEqual(null);
          expect(await getDbCollection("import.meta").find({ type: "organismes" }).toArray()).toEqual([
            yesterdayImportOrganismes,
            {
              _id: expect.any(ObjectId),
              import_date: now,
              source: {
                referentiel:
                  source === "referentiel"
                    ? todayImportOrganismes.source.referentiel
                    : yesterdayImportOrganismes.source.referentiel,
                communes:
                  source === "communes"
                    ? todayImportOrganismes.source.communes
                    : yesterdayImportOrganismes.source.communes,
              },
              status: "done",
              type: "organismes",
            },
          ]);
          expect(
            await getDbCollection("organisme")
              .find({}, { projection: { _id: 0 } })
              .toArray()
          ).toEqual(
            expectedOrganismes.map((o) => ({
              ...o,
              created_at: now,
              updated_at: now,
            }))
          );
        });
      }
    );
  });

  describe("when source are not in sync with organismes", () => {
    const existingOrganismes = {
      updated: [
        {
          ...expectedOrganismes[0],
          created_at: yesterday,
          updated_at: yesterday,
          identifiant: {
            siret: expectedOrganismes[0].identifiant.siret,
            uai: null,
          },
        },
      ],
      removed: [
        {
          ...expectedOrganismes[1],
          created_at: yesterday,
          updated_at: yesterday,
          identifiant: {
            siret: expectedOrganismes[1].identifiant.siret,
            uai: "0391210D",
          },
        },
      ],
    };

    beforeEach(async () => {
      await getDbCollection("import.meta").insertMany([
        yesterdayImports.referentiel,
        yesterdayImports.communes,
        yesterdayImportOrganismes,
        todayImports.referentiel,
        todayImports.communes,
      ]);

      await getDbCollection("organisme").insertMany(
        existingOrganismes.updated.map((o) => ({ ...o, _id: new ObjectId() }))
      );
      await getDbCollection("organisme").insertMany(
        existingOrganismes.removed.map((o) => ({ ...o, _id: new ObjectId() }))
      );

      await getDbCollection("source.referentiel").insertMany(
        sourceReferentielFixtures.map((data) => ({
          data,
          date: todayImports.referentiel.import_date,
          _id: new ObjectId(),
        }))
      );
      await getDbCollection("commune").insertMany(communesFixture);
      vi.mocked(getEtablissementDiffusible).mockImplementation(async (siret: string) => {
        return etablissementsFixture.find((e) => e.siret === siret) ?? null;
      });
    });

    it("should import organismes", async () => {
      expect(await importOrganismes()).toEqual(null);
      expect(
        await getDbCollection("import.meta")
          .find({ type: "organismes" }, { sort: { import_date: 1 } })
          .toArray()
      ).toEqual([
        yesterdayImportOrganismes,
        {
          _id: expect.any(ObjectId),
          import_date: now,
          source: {
            referentiel: { import_date: todayImports.referentiel.import_date },
            communes: { import_date: todayImports.communes.import_date },
          },
          status: "done",
          type: "organismes",
        },
      ]);

      const organismes = await getDbCollection("organisme")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, created_at: 1, updated_at: 1, statut: 1 },
            sort: { "identifiant.siret": 1, "identifiant.uai": 1 },
          }
        )
        .toArray();

      expect(organismes).toEqual(
        [
          {
            identifiant: expectedOrganismes[0].identifiant,
            created_at: existingOrganismes.updated[0].created_at,
            updated_at: now,
            statut: { referentiel: "présent" },
          },
          {
            identifiant: existingOrganismes.removed[0].identifiant,
            created_at: existingOrganismes.removed[0].created_at,
            updated_at: now,
            statut: { referentiel: "supprimé" },
          },
          {
            identifiant: expectedOrganismes[1].identifiant,
            created_at: now,
            updated_at: now,
            statut: { referentiel: "présent" },
          },
        ].toSorted((a, b) => {
          const siretDiff = a.identifiant.siret.localeCompare(b.identifiant.siret);
          if (siretDiff !== 0) {
            return siretDiff;
          }

          if (a.identifiant.uai === null) {
            return -1;
          }

          if (b.identifiant.uai === null) {
            return -1;
          }

          return a.identifiant.uai.localeCompare(b.identifiant.uai);
        })
      );
    });
  });

  describe("when etablissement is closed", () => {
    const initialOrganisme: IOrganismeInternal = {
      _id: new ObjectId(),
      identifiant: { siret: etablissementsFixture[2].siret, uai: null },
      etablissement: {
        adresse: {
          academie: {
            code: "09",
            id: "A09",
            nom: "Lille",
          },
          code_postal: "59800",
          commune: {
            code_insee: "59350",
            nom: "Lille",
          },
          departement: {
            code_insee: "59",
            nom: "Nord",
          },
          label: "40 PLACE DU THEATRE",
          region: {
            code_insee: "32",
            nom: "Hauts-de-France",
          },
        },
        geopoint: {
          type: "Point",
          coordinates: [3.064205, 50.637859],
        },
        creation: new Date("1970-01-19T23:49:51.600Z"),
        enseigne: "EMMENO - LE SUCCES EST LE FRUIT DE LA PERSEVERANCE",
        fermeture: null,
        ouvert: true,
        siret: etablissementsFixture[2].siret,
      },
      renseignements_specifiques: {
        numero_activite: "32591104359",
        qualiopi: false,
      },
      statut: {
        referentiel: "présent",
      },
      unite_legale: {
        actif: true,
        cessation: null,
        creation: new Date(1591826400),
        raison_sociale: "EMMENO PRESTIGE SCHOOL",
        siren: "130029754",
      },
      contacts: [],
      created_at: yesterday,
      updated_at: yesterday,
    };

    beforeEach(async () => {
      await getDbCollection("import.meta").insertMany([
        yesterdayImports.referentiel,
        yesterdayImports.communes,
        yesterdayImportOrganismes,
        todayImports.referentiel,
        todayImports.communes,
      ]);

      await getDbCollection("organisme").insertOne(initialOrganisme);

      await getDbCollection("source.referentiel").insertMany(
        sourceReferentielFixtures.map((data) => ({
          data,
          date: todayImports.referentiel.import_date,
          _id: new ObjectId(),
        }))
      );
      await getDbCollection("commune").insertMany(communesFixture);
      vi.mocked(getEtablissementDiffusible).mockImplementation(async (siret: string) => {
        return etablissementsFixture.find((e) => e.siret === siret) ?? null;
      });
      vi.mocked(getUniteLegaleDiffusible).mockImplementation(async (siren: string) => {
        return uniteLegaleFixture.find((e) => e.siren === siren) ?? null;
      });
    });

    it("should import organismes", async () => {
      expect(await importOrganismes()).toEqual(null);
      expect(
        await getDbCollection("import.meta")
          .find({ type: "organismes" }, { sort: { import_date: 1 } })
          .toArray()
      ).toEqual([
        yesterdayImportOrganismes,
        {
          _id: expect.any(ObjectId),
          import_date: now,
          source: {
            referentiel: { import_date: todayImports.referentiel.import_date },
            communes: { import_date: todayImports.communes.import_date },
          },
          status: "done",
          type: "organismes",
        },
      ]);

      const organismes = await getDbCollection("organisme")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, created_at: 1, updated_at: 1, statut: 1 },
            sort: { "identifiant.siret": 1, "identifiant.uai": 1 },
          }
        )
        .toArray();

      expect(organismes).toEqual(
        [
          {
            identifiant: initialOrganisme.identifiant,
            created_at: yesterday,
            updated_at: now,
            statut: { referentiel: "supprimé" },
          },
          {
            identifiant: expectedOrganismes[0].identifiant,
            created_at: now,
            updated_at: now,
            statut: { referentiel: "présent" },
          },
          {
            identifiant: expectedOrganismes[1].identifiant,
            created_at: now,
            updated_at: now,
            statut: { referentiel: "présent" },
          },
        ].toSorted((a, b) => {
          const siretDiff = a.identifiant.siret.localeCompare(b.identifiant.siret);
          if (siretDiff !== 0) {
            return siretDiff;
          }

          if (a.identifiant.uai === null) {
            return -1;
          }

          if (b.identifiant.uai === null) {
            return -1;
          }

          return a.identifiant.uai.localeCompare(b.identifiant.uai);
        })
      );

      const updatedOrganisme = await getDbCollection("organisme").findOne(
        {
          "identifiant.siret": initialOrganisme.identifiant.siret,
        },
        {
          projection: {
            "etablissement.ouvert": 1,
            "etablissement.fermeture": 1,
            "unite_legale.actif": 1,
            "unite_legale.cessation": 1,
          },
        }
      );
      expect(updatedOrganisme).toEqual({
        _id: initialOrganisme._id,
        etablissement: {
          fermeture: new Date("1970-01-20T14:21:00.000Z"),
          ouvert: false,
        },
        unite_legale: {
          actif: true,
          cessation: null,
        },
      });
    });
  });

  describe("when unite_legale is closed", () => {
    const initialOrganisme: IOrganismeInternal = {
      _id: new ObjectId(),
      identifiant: { siret: etablissementsFixture[3].siret, uai: null },
      etablissement: {
        adresse: {
          academie: {
            code: "09",
            id: "A09",
            nom: "Lille",
          },
          code_postal: "59800",
          commune: {
            code_insee: "59350",
            nom: "Lille",
          },
          departement: {
            code_insee: "59",
            nom: "Nord",
          },
          label: "40 PLACE DU THEATRE",
          region: {
            code_insee: "32",
            nom: "Hauts-de-France",
          },
        },
        geopoint: {
          type: "Point",
          coordinates: [3.064205, 50.637859],
        },
        creation: new Date("1970-01-19T23:49:51.600Z"),
        enseigne: "EMMENO - LE SUCCES EST LE FRUIT DE LA PERSEVERANCE",
        fermeture: null,
        ouvert: true,
        siret: etablissementsFixture[3].siret,
      },
      renseignements_specifiques: {
        numero_activite: "32591104359",
        qualiopi: false,
      },
      statut: {
        referentiel: "présent",
      },
      unite_legale: {
        actif: true,
        cessation: null,
        creation: new Date(1591826400),
        raison_sociale: "EMMENO PRESTIGE SCHOOL",
        siren: "130029754",
      },
      created_at: yesterday,
      updated_at: yesterday,
      contacts: [],
    };

    beforeEach(async () => {
      await getDbCollection("import.meta").insertMany([
        yesterdayImports.referentiel,
        yesterdayImports.communes,
        yesterdayImportOrganismes,
        todayImports.referentiel,
        todayImports.communes,
      ]);

      await getDbCollection("organisme").insertOne(initialOrganisme);

      await getDbCollection("source.referentiel").insertMany(
        sourceReferentielFixtures.map((data) => ({
          data,
          date: todayImports.referentiel.import_date,
          _id: new ObjectId(),
        }))
      );
      await getDbCollection("commune").insertMany(communesFixture);
      vi.mocked(getEtablissementDiffusible).mockImplementation(async (siret: string) => {
        return etablissementsFixture.find((e) => e.siret === siret) ?? null;
      });
      vi.mocked(getUniteLegaleDiffusible).mockImplementation(async (siren: string) => {
        return uniteLegaleFixture.find((e) => e.siren === siren) ?? null;
      });
    });

    it("should import organismes", async () => {
      expect(await importOrganismes()).toEqual(null);
      expect(
        await getDbCollection("import.meta")
          .find({ type: "organismes" }, { sort: { import_date: 1 } })
          .toArray()
      ).toEqual([
        yesterdayImportOrganismes,
        {
          _id: expect.any(ObjectId),
          import_date: now,
          source: {
            referentiel: { import_date: todayImports.referentiel.import_date },
            communes: { import_date: todayImports.communes.import_date },
          },
          status: "done",
          type: "organismes",
        },
      ]);

      const organismes = await getDbCollection("organisme")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, created_at: 1, updated_at: 1, statut: 1 },
            sort: { "identifiant.siret": 1, "identifiant.uai": 1 },
          }
        )
        .toArray();

      expect(organismes).toEqual(
        [
          {
            identifiant: initialOrganisme.identifiant,
            created_at: yesterday,
            updated_at: now,
            statut: { referentiel: "supprimé" },
          },
          {
            identifiant: expectedOrganismes[0].identifiant,
            created_at: now,
            updated_at: now,
            statut: { referentiel: "présent" },
          },
          {
            identifiant: expectedOrganismes[1].identifiant,
            created_at: now,
            updated_at: now,
            statut: { referentiel: "présent" },
          },
        ].toSorted((a, b) => {
          const siretDiff = a.identifiant.siret.localeCompare(b.identifiant.siret);
          if (siretDiff !== 0) {
            return siretDiff;
          }

          if (a.identifiant.uai === null) {
            return -1;
          }

          if (b.identifiant.uai === null) {
            return -1;
          }

          return a.identifiant.uai.localeCompare(b.identifiant.uai);
        })
      );

      const updatedOrganisme = await getDbCollection("organisme").findOne(
        {
          "identifiant.siret": initialOrganisme.identifiant.siret,
        },
        {
          projection: {
            "etablissement.ouvert": 1,
            "etablissement.fermeture": 1,
            "unite_legale.actif": 1,
            "unite_legale.cessation": 1,
          },
        }
      );
      expect(updatedOrganisme).toEqual({
        _id: initialOrganisme._id,
        etablissement: {
          fermeture: new Date("1970-01-20T23:51:14.400Z"),
          ouvert: false,
        },
        unite_legale: {
          actif: false,
          cessation: new Date("1970-01-20T23:51:14.400Z"),
        },
      });
    });
  });

  describe("when etablissement is not found, but legal unit is", () => {
    beforeEach(async () => {
      await getDbCollection("import.meta").insertMany([todayImports.referentiel, todayImports.communes]);

      await getDbCollection("source.referentiel").insertOne({
        data: generateOrganismeReferentielFixture({
          siret: etablissementNotFoundSiret,
        }),
        date: todayImports.referentiel.import_date,
        _id: new ObjectId(),
      });

      await getDbCollection("commune").insertMany(communesFixture);

      vi.mocked(getEtablissementDiffusible).mockImplementation(async (siret: string) => {
        return etablissementsFixture.find((e) => e.siret === siret) ?? null;
      });
      vi.mocked(getUniteLegaleDiffusible).mockImplementation(async (siren: string) => {
        return uniteLegaleFixture.find((e) => e.siren === siren) ?? null;
      });
    });

    it("should import organismes", async () => {
      expect(await importOrganismes()).toEqual(null);
      expect(
        await getDbCollection("import.meta")
          .find({ type: "organismes" }, { sort: { import_date: 1 } })
          .toArray()
      ).toEqual([
        {
          _id: expect.any(ObjectId),
          import_date: now,
          source: {
            referentiel: { import_date: todayImports.referentiel.import_date },
            communes: { import_date: todayImports.communes.import_date },
          },
          status: "done",
          type: "organismes",
        },
      ]);

      const organismes = await getDbCollection("organisme")
        .find(
          {},
          {
            projection: {
              _id: 0,
              identifiant: 1,
              etablissement: 1,
              unite_legale: 1,
            },
            sort: { "identifiant.siret": 1, "identifiant.uai": 1 },
          }
        )
        .toArray();

      const expectedOrganisme: Pick<IOrganismeInternal, "identifiant" | "etablissement" | "unite_legale"> = {
        identifiant: { siret: etablissementNotFoundSiret, uai: null },
        etablissement: {
          adresse: null,
          geopoint: null,
          creation: new Date("1900-01-01T00:00:00.000Z"),
          enseigne: null,
          fermeture: null,
          ouvert: false,
          siret: etablissementNotFoundSiret,
        },
        unite_legale: {
          actif: true,
          cessation: null,
          creation: new Date("1969-12-31T14:34:01.200Z"),
          raison_sociale: "ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLE DE DOUAI",
          siren: "195932553",
        },
      };

      expect(organismes).toEqual([expectedOrganisme]);
    });
  });

  describe("when legal unit is not found", () => {
    beforeEach(async () => {
      await getDbCollection("import.meta").insertMany([todayImports.referentiel, todayImports.communes]);

      await getDbCollection("source.referentiel").insertOne({
        data: generateOrganismeReferentielFixture({
          siret: etablissementNotFoundSiret,
        }),
        date: todayImports.referentiel.import_date,
        _id: new ObjectId(),
      });

      await getDbCollection("commune").insertMany(communesFixture);

      vi.mocked(getEtablissementDiffusible).mockResolvedValue(null);
      vi.mocked(getUniteLegaleDiffusible).mockResolvedValue(null);
    });

    it("should skip the organisme", async () => {
      expect(await importOrganismes()).toEqual(null);
      expect(
        await getDbCollection("import.meta")
          .find({ type: "organismes" }, { sort: { import_date: 1 } })
          .toArray()
      ).toEqual([
        {
          _id: expect.any(ObjectId),
          import_date: now,
          source: {
            referentiel: { import_date: todayImports.referentiel.import_date },
            communes: { import_date: todayImports.communes.import_date },
          },
          status: "done",
          type: "organismes",
        },
      ]);

      const organismes = await getDbCollection("organisme").find().toArray();

      expect(organismes).toEqual([]);
    });
  });
});
