import { ObjectId } from "mongodb";
import { generateNpecFixture } from "shared/models/fixtures/index";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildCpneIdccMap, runNpecNormalizer } from "./npec.normalizer.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { useMongo } from "@tests/mongo.test.utils.js";

useMongo();

describe("buildCpneIdccMap", () => {
  it("should build cpneIdccMap correctly", async () => {
    const filename = "vf_referentiel_avec_idcc_oct_2019.xlsx";

    await getDbCollection("source.npec").insertMany([
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "2", idcc: "478" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "4", idcc: "1801" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "4", idcc: "1802" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "5", idcc: "2205" } }),
    ]);

    const result = await buildCpneIdccMap(filename);

    expect(result).toEqual(
      new Map([
        ["2", new Set([478])],
        ["4", new Set([1801, 1802])],
        ["5", new Set([2205])],
      ])
    );
  });
});

describe("runNpecNormalizer", () => {
  const importDate = new Date("2024-08-19T10:00:00.000Z");
  const now = new Date(importDate.getTime() + 300_000);
  const filename = "vf_referentiel_avec_idcc_oct_2019.xlsx";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    return () => {
      vi.useRealTimers();
    };
  });

  it('should skip normalization if "file_date" is before July 1, 2022', async () => {
    await getDbCollection("source.npec").insertMany([
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "2", idcc: "478" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "4", idcc: "1801" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "4", idcc: "1802" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "5", idcc: "2205" } }),
    ]);

    const importMeta = {
      _id: new ObjectId(),
      import_date: importDate,
      type: "npec",
      status: "pending",
      resource: "https://resource.francecompetences.fr/npec/vf_referentiel_avec_idcc_oct_2019.xlsx",
      title:
        "Référentiel unique avec l’ensemble des niveaux de prise en charge des contrats d’apprentissage – Juillet 2024",
      description: "Fichier zip 24 Mo (Version du 18/07/2024)",
      file_date: new Date("2022-06-30T00:00:00Z"),
    } as const;

    const npecData = [
      {
        type: "npec",
        rncp: "RNCP1002",
        formation_libelle: "Mise en oeuvre caoutchoucs élastomères thermoplastiques",
        certificateur: "MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE",
        diplome_code: null,
        diplome_libelle: "BP",
        cpne_code: "2",
        cpne_libelle: "CNPE des sociétés financières",
        npec: 9497,
        statut: "A",
        date_applicabilite: new Date("2021-10-15T00:00:00.000Z"),
        procedure: null,
        idcc: null,
      },
    ] as const;

    const npecDocs = npecData.map((data) =>
      generateNpecFixture({
        filename,
        date_import: importMeta.import_date,
        import_id: importMeta._id,
        date_file: importMeta.file_date,
        data,
      })
    );

    await getDbCollection("source.npec").insertMany(npecDocs);

    await runNpecNormalizer(importMeta);

    expect(await getDbCollection("source.npec.normalized").find().toArray()).toEqual([]);
  });

  it('should normalization if "file_date" is after July 1, 2022', async () => {
    await getDbCollection("source.npec").insertMany([
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "2", idcc: "478" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "4", idcc: "1801" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "4", idcc: "1802" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "5", idcc: "2205" } }),
    ]);

    const importMeta = {
      _id: new ObjectId(),
      import_date: importDate,
      type: "npec",
      status: "pending",
      resource: "https://resource.francecompetences.fr/npec/vf_referentiel_avec_idcc_oct_2019.xlsx",
      title:
        "Référentiel unique avec l’ensemble des niveaux de prise en charge des contrats d’apprentissage – Juillet 2024",
      description: "Fichier zip 24 Mo (Version du 18/07/2024)",
      file_date: new Date("2022-07-01T00:00:00Z"),
    } as const;

    const npecData = [
      {
        type: "npec",
        rncp: "RNCP1002",
        formation_libelle: "Mise en oeuvre caoutchoucs élastomères thermoplastiques",
        certificateur: "MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE",
        diplome_code: null,
        diplome_libelle: "BP",
        cpne_code: "2",
        cpne_libelle: "CNPE des sociétés financières",
        npec: 9497,
        statut: "A",
        date_applicabilite: new Date("2021-10-15T00:00:00.000Z"),
        procedure: null,
        idcc: null,
      },
    ] as const;

    const npecDocs = npecData.map((data) =>
      generateNpecFixture({
        filename,
        date_import: importMeta.import_date,
        import_id: importMeta._id,
        date_file: importMeta.file_date,
        data,
      })
    );

    await getDbCollection("source.npec").insertMany(npecDocs);

    await runNpecNormalizer(importMeta);

    expect(await getDbCollection("source.npec.normalized").find().toArray()).toEqual([
      {
        _id: expect.any(ObjectId),
        rncp: "RNCP1002",
        cpne_code: npecData[0].cpne_code,
        cpne_libelle: npecData[0].cpne_libelle,
        date_applicabilite: new Date("2021-10-15T00:00:00.000+02:00"),
        date_file: importMeta.file_date,
        date_import: importMeta.import_date,
        filename,
        idcc: [478],
        import_id: importMeta._id,
        npec: [npecData[0].npec],
      },
    ]);
  });

  it("should normalize npec data with multiple RNCP", async () => {
    await getDbCollection("source.npec").insertMany([
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "2", idcc: "478" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "4", idcc: "1801" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "4", idcc: "1802" } }),
      generateNpecFixture({ filename, data: { type: "cpne-idcc", cpne_code: "5", idcc: "2205" } }),
    ]);

    const importMeta = {
      _id: new ObjectId(),
      import_date: importDate,
      type: "npec",
      status: "pending",
      resource: "https://resource.francecompetences.fr/npec/vf_referentiel_avec_idcc_oct_2019.xlsx",
      title:
        "Référentiel unique avec l’ensemble des niveaux de prise en charge des contrats d’apprentissage – Juillet 2024",
      description: "Fichier zip 24 Mo (Version du 18/07/2024)",
      file_date: new Date("2024-07-11T22:00:00.000+00:00"),
    } as const;

    const npecData = [
      {
        type: "npec",
        rncp: "RNCP1002",
        formation_libelle: "Mise en oeuvre caoutchoucs élastomères thermoplastiques",
        certificateur: "MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE",
        diplome_code: null,
        diplome_libelle: "BP",
        cpne_code: "2",
        cpne_libelle: "CNPE des sociétés financières",
        npec: 9497,
        statut: "A",
        date_applicabilite: new Date("2023-10-15T00:00:00.000Z"),
        procedure: null,
        idcc: null,
      },
      {
        type: "npec",
        rncp: "RNCP1006/RNCP37239",
        formation_libelle: "Pilote d'installations de production par procédés",
        certificateur: "MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE",
        diplome_code: null,
        diplome_libelle: "BP",
        cpne_code: "4",
        cpne_libelle: "CNPEFP des sociétés d’assistance",
        npec: 8500,
        statut: "A",
        date_applicabilite: new Date("2023-10-15T00:00:00.000Z"),
        procedure: null,
        idcc: null,
      },
      {
        type: "npec",
        rncp: "RNCP1006/",
        formation_libelle: "Pilote d'installations de production par procédés",
        certificateur: "MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE",
        diplome_code: null,
        diplome_libelle: "BP",
        cpne_code: "5",
        cpne_libelle: "CPNE du notariat",
        npec: 9700,
        statut: "A",
        date_applicabilite: new Date("2023-10-15T00:00:00.000Z"),
        procedure: null,
        idcc: null,
      },
    ] as const;

    const npecDocs = npecData.map((data) =>
      generateNpecFixture({
        filename,
        date_import: importMeta.import_date,
        import_id: importMeta._id,
        date_file: importMeta.file_date,
        data,
      })
    );

    await getDbCollection("source.npec").insertMany(npecDocs);

    await runNpecNormalizer(importMeta);

    expect(await getDbCollection("source.npec.normalized").find().toArray()).toEqual([
      {
        _id: expect.any(ObjectId),
        rncp: "RNCP1002",
        cpne_code: npecData[0].cpne_code,
        cpne_libelle: npecData[0].cpne_libelle,
        date_applicabilite: new Date("2023-10-15T00:00:00.000+02:00"),
        date_file: importMeta.file_date,
        date_import: importMeta.import_date,
        filename,
        idcc: [478],
        import_id: importMeta._id,
        npec: [npecData[0].npec],
      },
      {
        _id: expect.any(ObjectId),
        rncp: "RNCP1006",
        cpne_code: npecData[1].cpne_code,
        cpne_libelle: npecData[1].cpne_libelle,
        date_applicabilite: new Date("2023-10-15T00:00:00.000+02:00"),
        date_file: importMeta.file_date,
        date_import: importMeta.import_date,
        filename,
        idcc: [1801, 1802],
        import_id: importMeta._id,
        npec: [npecData[1].npec],
      },
      {
        _id: expect.any(ObjectId),
        rncp: "RNCP37239",
        cpne_code: npecData[1].cpne_code,
        cpne_libelle: npecData[1].cpne_libelle,
        date_applicabilite: new Date("2023-10-15T00:00:00.000+02:00"),
        date_file: importMeta.file_date,
        date_import: importMeta.import_date,
        filename,
        idcc: [1801, 1802],
        import_id: importMeta._id,
        npec: [npecData[1].npec],
      },
      {
        _id: expect.any(ObjectId),
        rncp: "RNCP1006",
        cpne_code: npecData[2].cpne_code,
        cpne_libelle: npecData[2].cpne_libelle,
        date_applicabilite: new Date("2023-10-15T00:00:00.000+02:00"),
        date_file: importMeta.file_date,
        date_import: importMeta.import_date,
        filename,
        idcc: [2205],
        import_id: importMeta._id,
        npec: [npecData[2].npec],
      },
    ]);
  });
});
