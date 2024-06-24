import { useMongo } from "@tests/mongo.test.utils";
import { createReadStream } from "fs";
import { readFile } from "fs/promises";
import { ObjectId } from "mongodb";
import nock from "nock";
import { dirname, join } from "path";
import { IImportMetaDaresCcn } from "shared/models/import.meta.model";
import { fileURLToPath } from "url";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService";

import { runDaresConventionCollectivesImporter } from "./dares.ccn.importer";

describe("runConventionCollectivesImporter", () => {
  useMongo();

  const lastMonth = new Date("2024-05-14T09:00:07.000Z");
  const now = new Date("2024-06-14T09:00:07.000Z");
  const yesterday = new Date("2024-06-13T09:00:07.000Z");
  const twoDaysAgo = new Date("2024-06-12T09:00:07.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    nock.disableNetConnect();

    return () => {
      vi.useRealTimers();
      nock.cleanAll();
      nock.enableNetConnect();
    };
  });

  const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

  it("should import ccn data", async () => {
    const scope = nock("https://travail-emploi.gouv.fr");
    scope
      .get("/dialogue-social/negociation-collective/article/conventions-collectives-nomenclatures")
      .reply(200, await readFile(join(fixtureDir, "article.html"), "utf-8"));
    scope
      .head("/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx")
      .reply(200, "", { "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT" });
    scope
      .get("/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx")
      .reply(200, createReadStream(join(fixtureDir, "sample.xlsx")), {
        "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT",
      });

    await runDaresConventionCollectivesImporter();

    const imports = await getDbCollection("import.meta").find({}).toArray();
    expect(imports).toEqual([
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "dares_ccn",
        status: "done",
        resource: {
          date: new Date("2024-06-06T22:00:00.000Z"),
          title: "Liste des conventions collectives et de leur code IDCC - Juin 2024",
          url: "https://travail-emploi.gouv.fr/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx",
        },
      },
    ]);

    const result = await getDbCollection("source.dares.ccn")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    expect(result).toEqual([
      {
        data: {
          idcc: 16,
          titre: "Convention collective nationale des transports routiers et activités auxiliaires du transport",
        },
        date_import: now,
        import_id: imports[0]._id,
      },
      {
        data: {
          idcc: 18,
          titre: "Convention collective nationale des industries textiles",
        },
        date_import: now,
        import_id: imports[0]._id,
      },
      {
        data: {
          idcc: 29,
          titre:
            "Convention collective nationale des établissements privés d'hospitalisation, de soins, de cure et de garde à but non lucratif (FEHAP, convention de 1951)",
        },
        date_import: now,
        import_id: imports[0]._id,
      },
    ]);
  });

  it("should skip if file is up to date", async () => {
    const scope = nock("https://travail-emploi.gouv.fr");
    scope
      .get("/dialogue-social/negociation-collective/article/conventions-collectives-nomenclatures")
      .reply(200, await readFile(join(fixtureDir, "article.html"), "utf-8"));
    scope
      .head("/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx")
      .reply(200, "", { "last-modified": lastMonth.toString() });
    // scope
    //   .get("/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx")
    //   .reply(200, createReadStream(join(fixtureDir, "sample.xlsx")), {
    //     "last-modified": lastMonth.toString()
    //   });

    const initialImport: IImportMetaDaresCcn = {
      _id: new ObjectId(),
      import_date: yesterday,
      type: "dares_ccn",
      status: "done",
      resource: {
        date: lastMonth,
        title: "Liste des conventions collectives et de leur code IDCC - Mai 2024",
        url: "https://travail-emploi.gouv.fr/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx",
      },
    };

    const initialData = [
      {
        _id: new ObjectId(),
        data: {
          idcc: 87,
          titre: "Convention collective nationale des ouvriers des industries de carrières et de matériaux",
        },
        date_import: yesterday,
        import_id: initialImport._id,
      },
      {
        _id: new ObjectId(),
        data: {
          idcc: 158,
          titre:
            "Convention collective nationale du travail mécanique du bois, des scieries, du négoce et de l'importation des bois",
        },
        date_import: yesterday,
        import_id: initialImport._id,
      },
    ];

    await getDbCollection("import.meta").insertOne(initialImport);
    await getDbCollection("source.dares.ccn").insertMany(initialData);

    await runDaresConventionCollectivesImporter();

    const imports = await getDbCollection("import.meta").find({}).toArray();
    expect(imports).toEqual([initialImport]);

    const result = await getDbCollection("source.dares.ccn")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    expect(result).toEqual(initialData.map(({ _id, ...d }) => ({ ...d })));
  });

  it("should update when new file", async () => {
    const scope = nock("https://travail-emploi.gouv.fr");
    scope
      .get("/dialogue-social/negociation-collective/article/conventions-collectives-nomenclatures")
      .reply(200, await readFile(join(fixtureDir, "article.html"), "utf-8"));
    scope
      .head("/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx")
      .reply(200, "", { "last-modified": yesterday.toString() });
    scope
      .get("/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx")
      .reply(200, createReadStream(join(fixtureDir, "sample.xlsx")), {
        "last-modified": yesterday.toString(),
      });

    const initialImport: IImportMetaDaresCcn = {
      _id: new ObjectId(),
      import_date: twoDaysAgo,
      type: "dares_ccn",
      status: "done",
      resource: {
        date: twoDaysAgo,
        title: "Liste des conventions collectives et de leur code IDCC - Mai 2024",
        url: "https://travail-emploi.gouv.fr/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx",
      },
    };

    const initialData = [
      {
        _id: new ObjectId(),
        data: {
          idcc: 87,
          titre: "Convention collective nationale des ouvriers des industries de carrières et de matériaux",
        },
        date_import: twoDaysAgo,
        import_id: initialImport._id,
      },
      {
        _id: new ObjectId(),
        data: {
          idcc: 158,
          titre:
            "Convention collective nationale du travail mécanique du bois, des scieries, du négoce et de l'importation des bois",
        },
        date_import: twoDaysAgo,
        import_id: initialImport._id,
      },
    ];

    await getDbCollection("import.meta").insertOne(initialImport);
    await getDbCollection("source.dares.ccn").insertMany(initialData);

    await runDaresConventionCollectivesImporter();

    const imports = await getDbCollection("import.meta").find({}).toArray();
    expect(imports).toEqual([
      initialImport,
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "dares_ccn",
        status: "done",
        resource: {
          date: yesterday,
          title: "Liste des conventions collectives et de leur code IDCC - Juin 2024",
          url: "https://travail-emploi.gouv.fr/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx",
        },
      },
    ]);

    const result = await getDbCollection("source.dares.ccn")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    expect(result).toEqual([
      ...initialData.map(({ _id, ...d }) => ({ ...d })),
      {
        data: {
          idcc: 16,
          titre: "Convention collective nationale des transports routiers et activités auxiliaires du transport",
        },
        date_import: now,
        import_id: imports[1]._id,
      },
      {
        data: {
          idcc: 18,
          titre: "Convention collective nationale des industries textiles",
        },
        date_import: now,
        import_id: imports[1]._id,
      },
      {
        data: {
          idcc: 29,
          titre:
            "Convention collective nationale des établissements privés d'hospitalisation, de soins, de cure et de garde à but non lucratif (FEHAP, convention de 1951)",
        },
        date_import: now,
        import_id: imports[1]._id,
      },
    ]);
  });
});
