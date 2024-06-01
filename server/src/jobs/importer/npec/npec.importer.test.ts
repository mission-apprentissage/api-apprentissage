import { createReadStream } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { internal } from "@hapi/boom";
import { captureException } from "@sentry/node";
import { useMongo } from "@tests/mongo.test.utils";
import { addJob } from "job-processor";
import { ObjectId } from "mongodb";
import { IImportMetaNpec } from "shared/models/import.meta.model";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService";

import { importNpecResource, onImportNpecResourceFailure, runNpecImporter } from "./npec.importer";
import { downloadXlsxNPECFile, getNpecFilename, scrapeRessourceNPEC } from "./scraper/npec.scraper";

vi.mock("./scraper/npec.scraper");

vi.mock("@sentry/node");

vi.mock("job-processor", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    addJob: vi.fn().mockResolvedValue(undefined),
  };
});

describe("runRncpImporter", () => {
  const now = new Date("2024-02-25T09:00:07.000Z");
  useMongo();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    return () => {
      vi.mocked(scrapeRessourceNPEC).mockReset();
      vi.useRealTimers();
    };
  });

  it("should schedule properly", async () => {
    const newResource = {
      url: "https://www.francecompetences.fr/upload/new.xlsx",
      date: new Date("2024-01-01T00:00:00.000Z"),
    };

    const existingResource = {
      url: "https://www.francecompetences.fr/upload/existing.xlsx",
      date: new Date("2023-09-01T00:00:00.000Z"),
    };
    const failedResource = {
      url: "https://www.francecompetences.fr/upload/failed.xlsx",
      date: new Date("2023-10-01T00:00:00.000Z"),
    };
    const pendingResource = {
      url: "https://www.francecompetences.fr/upload/pending.xlsx",
      date: new Date("2023-11-01T00:00:00.000Z"),
    };
    const removedResource = {
      url: "https://www.francecompetences.fr/upload/removed.xlsx",
      date: new Date("2023-12-01T00:00:00.000Z"),
    };

    vi.mocked(scrapeRessourceNPEC).mockResolvedValue([existingResource, failedResource, pendingResource, newResource]);

    const initialImports: IImportMetaNpec[] = [
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-21T09:00:00.000Z"),
        type: "npec",
        status: "done",
        resource: existingResource.url,
        file_date: existingResource.date,
      },
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-20T09:00:00.000Z"),
        type: "npec",
        status: "failed",
        resource: failedResource.url,
        file_date: failedResource.date,
      },
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-22T09:00:00.000Z"),
        type: "npec",
        status: "pending",
        resource: pendingResource.url,
        file_date: pendingResource.date,
      },
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-23T09:00:00.000Z"),
        type: "npec",
        status: "done",
        resource: removedResource.url,
        file_date: removedResource.date,
      },
    ];
    await getDbCollection("import.meta").insertMany(initialImports);

    await runNpecImporter();

    expect(scrapeRessourceNPEC).toHaveBeenCalledWith();

    const newImportMeta: IImportMetaNpec = {
      _id: expect.any(ObjectId),
      import_date: now,
      type: "npec",
      resource: newResource.url,
      file_date: newResource.date,
      status: "pending",
    };

    const retryImportMeta: IImportMetaNpec = {
      ...initialImports[1],
      status: "pending",
    };

    await expect(getDbCollection("import.meta").find({}).toArray()).resolves.toEqual([
      initialImports[0],
      retryImportMeta,
      initialImports[2],
      initialImports[3],
      newImportMeta,
    ]);
    expect(addJob).toHaveBeenCalledTimes(2);
    expect(addJob).toHaveBeenNthCalledWith(1, {
      name: "import:npec:resource",
      payload: newImportMeta,
      queued: true,
    });
    expect(addJob).toHaveBeenNthCalledWith(2, {
      name: "import:npec:resource",
      payload: retryImportMeta,
      queued: true,
    });
    expect(captureException).toHaveBeenCalledTimes(2);
    expect(captureException).toHaveBeenCalledWith(
      internal("npec.importer: found an import meta for a resource that is still pending")
    );
    expect(captureException).toHaveBeenCalledWith(
      internal("npec.importer: found an import meta for a resource that is not in the dataset")
    );
  });
});

describe("onImportRncpArchiveFailure", () => {
  useMongo();

  it("should remove failed import meta", async () => {
    const existingResource = {
      url: "https://www.francecompetences.fr/upload/existing.xlsx",
      date: new Date("2023-09-01T00:00:00.000Z"),
    };
    const failedResource = {
      url: "https://www.francecompetences.fr/upload/failed.xlsx",
      date: new Date("2023-10-01T00:00:00.000Z"),
    };

    const initialImports: IImportMetaNpec[] = [
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-21T09:00:00.000Z"),
        type: "npec",
        resource: existingResource.url,
        file_date: existingResource.date,
        status: "done",
      },
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-20T09:00:00.000Z"),
        type: "npec",
        resource: failedResource.url,
        file_date: failedResource.date,
        status: "pending",
      },
    ];

    await getDbCollection("import.meta").insertMany(initialImports);

    await onImportNpecResourceFailure(initialImports[1]);

    await expect(getDbCollection("import.meta").find({}).toArray()).resolves.toEqual([
      initialImports[0],
      {
        ...initialImports[1],
        status: "failed",
      },
    ]);
  });
});

describe("importNpecResource", () => {
  const now = new Date("2024-02-25T09:00:07.000Z");
  useMongo();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    return () => {
      vi.mocked(scrapeRessourceNPEC).mockReset();
      vi.useRealTimers();
    };
  });

  const expectedDataMap = {
    "referentiel_des_npec-2-1.xlsx": {
      source: [
        {
          certificateur: null,
          cpne_code: null,
          cpne_libelle: "CPNE des sociétés financières",
          date_applicabilite: null,
          diplome_code: "1022001",
          diplome_libelle: "AGENT DE CONTROLE NON DESTRUCTIF (MC NIVEAU IV)",
          formation_libelle: null,
          idcc: null,
          npec: 6079.3333,
          procedure: null,
          rncp: null,
          statut: "D",
          type: "npec",
        },
        {
          certificateur: null,
          cpne_code: null,
          cpne_libelle: "CPNE DES SOCIÉTÉS D'ASSISTANCE",
          date_applicabilite: null,
          diplome_code: "1022001",
          diplome_libelle: "AGENT DE CONTROLE NON DESTRUCTIF (MC NIVEAU IV)",
          formation_libelle: null,
          idcc: null,
          npec: 6079.3333,
          procedure: null,
          rncp: null,
          statut: "D",
          type: "npec",
        },
        {
          certificateur: null,
          cpne_code: null,
          cpne_libelle: "CPNEFP dans le notariat",
          date_applicabilite: null,
          diplome_code: "1022001",
          diplome_libelle: "AGENT DE CONTROLE NON DESTRUCTIF (MC NIVEAU IV)",
          formation_libelle: null,
          idcc: null,
          npec: 6079.3333,
          procedure: null,
          rncp: null,
          statut: "D",
          type: "npec",
        },
      ],
      normalized: [],
      date: new Date("2019-09-15T22:00:00.000+00:00"),
    },
    "vf_referentiel_avec_idcc_oct_2019.xlsx": {
      source: [
        {
          certificateur: null,
          cpne_code: "2",
          cpne_libelle: "CNPE des sociétés financières ",
          date_applicabilite: null,
          diplome_code: "1022001",
          diplome_libelle: "AGENT DE CONTROLE NON DESTRUCTIF (MC NIVEAU IV)",
          formation_libelle: null,
          idcc: "478",
          npec: 6079.3333,
          procedure: null,
          rncp: null,
          statut: "D",
          type: "npec",
        },
        {
          certificateur: null,
          cpne_code: "4",
          cpne_libelle: "CPNE des sociétés d'assistance",
          date_applicabilite: null,
          diplome_code: "1022001",
          diplome_libelle: "AGENT DE CONTROLE NON DESTRUCTIF (MC NIVEAU IV)",
          formation_libelle: null,
          idcc: "1801",
          npec: 6079.3333,
          procedure: null,
          rncp: null,
          statut: "D",
          type: "npec",
        },
        {
          certificateur: null,
          cpne_code: "5",
          cpne_libelle: "CPNEFP dans le notariat",
          date_applicabilite: null,
          diplome_code: "1022001",
          diplome_libelle: "AGENT DE CONTROLE NON DESTRUCTIF (MC NIVEAU IV)",
          formation_libelle: null,
          idcc: "2205",
          npec: 6079.3333,
          procedure: null,
          rncp: null,
          statut: "D",
          type: "npec",
        },
        {
          cpne_code: "2",
          cpne_libelle: "CNPE des sociétés financières ",
          idcc: "478",
          type: "cpne-idcc",
        },
        {
          cpne_code: "4",
          cpne_libelle: "CPNE des sociétés d'assistance",
          idcc: "1801",
          type: "cpne-idcc",
        },
        {
          cpne_code: "5",
          cpne_libelle: "CPNEFP dans le notariat",
          idcc: "2205",
          type: "cpne-idcc",
        },
      ],
      normalized: [],
      date: new Date("2019-10-23T22:00:00.000+00:00"),
    },
    "VF_11.02.2021_Référentiel-NPEC-20192020_avec_idcc.xlsx": {
      source: [
        {
          certificateur: null,
          cpne_code: "1",
          cpne_libelle: "CNEFP du diagnostic technique immobillier",
          date_applicabilite: null,
          diplome_code: "1022001",
          diplome_libelle: null,
          formation_libelle: "AGENT DE CONTROLE NON DESTRUCTIF (MC NIVEAU IV)",
          idcc: "NA",
          npec: 6079,
          procedure: null,
          rncp: "RNCP955",
          statut: "D",
          type: "npec",
        },
        {
          certificateur: null,
          cpne_code: "2",
          cpne_libelle: "CNPE des sociétés financières ",
          date_applicabilite: null,
          diplome_code: "1022001",
          diplome_libelle: null,
          formation_libelle: "AGENT DE CONTROLE NON DESTRUCTIF (MC NIVEAU IV)",
          idcc: "478",
          npec: 6079,
          procedure: null,
          rncp: "RNCP955",
          statut: "D",
          type: "npec",
        },
        {
          cpne_code: "2",
          cpne_libelle: "CNPE des sociétés financières ",
          idcc: "478",
          type: "cpne-idcc",
        },
        {
          cpne_code: "4",
          cpne_libelle: "CPNE des sociétés d'assistance",
          idcc: "1801",
          type: "cpne-idcc",
        },
      ],
      normalized: [],
      date: new Date("2021-02-14T23:00:00.000+00:00"),
    },
    "Referentiel-des-NPEC_vMAJ-09.04.2024.xlsx": {
      source: [
        {
          certificateur: "MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE",
          cpne_code: "2",
          cpne_libelle: "CNPE des sociétés financières",
          date_applicabilite: new Date("2023-10-15T00:00:00.000Z"),
          diplome_code: null,
          diplome_libelle: "BP",
          formation_libelle: "Mise en oeuvre caoutchoucs élastomères thermoplastiques",
          idcc: null,
          npec: 9497,
          procedure: null,
          rncp: "RNCP1002",
          statut: "A",
          type: "npec",
        },
        {
          certificateur: "MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE",
          cpne_code: "4",
          cpne_libelle: "CNPEFP des sociétés d’assistance",
          date_applicabilite: new Date("2023-10-15T00:00:00.000Z"),
          diplome_code: null,
          diplome_libelle: "BP",
          formation_libelle: "Mise en oeuvre caoutchoucs élastomères thermoplastiques",
          idcc: null,
          npec: null,
          procedure: null,
          rncp: "RNCP1002",
          statut: "A",
          type: "npec",
        },
        {
          cpne_code: "2",
          cpne_libelle: "CNPE des sociétés financières",
          idcc: "478",
          type: "cpne-idcc",
        },
      ],
      normalized: [
        {
          _id: expect.any(ObjectId),
          cpne_code: "2",
          cpne_libelle: "CNPE des sociétés financières",
          date_applicabilite: new Date("2023-10-15T00:00:00.000+02:00"),
          idcc: ["478"],
          npec: 9497,
          rncp: "RNCP1002",
          filename: "Referentiel-des-NPEC_vMAJ-09.04.2024.xlsx",
          date_file: new Date("2024-04-03T00:00:00.000+02:00"),
          date_import: now,
        },
      ],
      date: new Date("2024-04-03T00:00:00.000+02:00"),
    },
  } as const;

  it.each<[keyof typeof expectedDataMap]>([
    ["referentiel_des_npec-2-1.xlsx"],
    ["vf_referentiel_avec_idcc_oct_2019.xlsx"],
    ["VF_11.02.2021_Référentiel-NPEC-20192020_avec_idcc.xlsx"],
    ["Referentiel-des-NPEC_vMAJ-09.04.2024.xlsx"],
  ])("should import correctly %s", async (filename) => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), `fixtures/${filename}`);
    const s = createReadStream(dataFixture);

    const importMeta: IImportMetaNpec = {
      _id: new ObjectId(),
      import_date: new Date(),
      type: "npec",
      status: "pending",
      resource: `https://www.francecompetences.fr/upload/${filename}`,
      file_date: expectedDataMap[filename].date,
    };

    await getDbCollection("import.meta").insertOne(importMeta);
    vi.mocked(downloadXlsxNPECFile).mockResolvedValue(s);
    vi.mocked(getNpecFilename).mockReturnValue(filename);

    const expectedData = expectedDataMap[filename].source.map((data) => ({
      _id: expect.any(ObjectId),
      filename,
      data,
      date_import: now,
      date_file: importMeta.file_date,
    }));

    const result = await importNpecResource(importMeta);

    expect(downloadXlsxNPECFile).toHaveBeenCalledWith(importMeta.resource);

    const data = await getDbCollection("source.npec").find({}).toArray();
    expect(data).toEqual(expectedData);
    expect(getDbCollection("import.meta").findOne({ _id: importMeta._id })).resolves.toEqual({
      ...importMeta,
      status: "done",
    });
    expect(result).toEqual({
      npecCount: expectedData.filter((d) => d.data.type === "npec").length,
      cpneIdccCount: expectedData.filter((d) => d.data.type === "cpne-idcc").length,
      npecNormalizedCount: expectedDataMap[filename].normalized.length,
    });
    const dataNormalized = await getDbCollection("source.npec.normalized").find({}).toArray();
    expect(dataNormalized).toEqual(expectedDataMap[filename].normalized);
  });
});
