import { createReadStream } from "fs";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import type { IImportMetaDares } from "shared/models/import.meta.model";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { runDaresApeIdccImporter } from "./dares.ape_idcc.importer.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { useMongo } from "@tests/mongo.test.utils.js";

describe("runDaresApeIdccImporter", () => {
  useMongo();

  const lastMonth = new Date("2024-05-14T09:00:07.000Z");
  const now = new Date("2024-06-14T09:00:07.000Z");
  const yesterday = new Date("2024-06-13T09:00:07.000Z");
  const twoDaysAgo = new Date("2024-06-12T09:00:07.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    disableNetConnect();

    return () => {
      vi.useRealTimers();
      cleanAll();
      enableNetConnect();
    };
  });

  const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

  it("should import ape-idcc data", async () => {
    const scope = nock("https://dares.travail-emploi.gouv.fr");
    scope
      .get("/donnees/les-portraits-statistiques-de-branches-professionnelles")
      .reply(200, await readFile(join(fixtureDir, "article.html"), "utf-8"));
    scope
      .head("/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx")
      .reply(200, "", { "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT" });
    scope
      .get("/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx")
      .reply(200, createReadStream(join(fixtureDir, "sample.xlsx")), {
        "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT",
      });

    await runDaresApeIdccImporter();

    const imports = await getDbCollection("import.meta").find({}).toArray();
    expect(imports).toEqual([
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "dares_ape_idcc",
        status: "done",
        resource: {
          date: new Date("2024-06-06T22:00:00.000Z"),
          title: "Table de passage entre la convention collective (code IDCC) et le secteur d'activité (code APE)",
          url: "https://dares.travail-emploi.gouv.fr/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx",
        },
      },
    ]);

    const result = await getDbCollection("source.dares.ape_idcc")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    expect(result).toEqual([
      {
        data: {
          naf: {
            code: "0111Z",
            intitule: "Culture de céréales (à l exception du riz), de légumineuses et de graines oléagineuses",
          },
          convention_collective: null,
        },
        date_import: now,
        import_id: imports[0]._id,
      },
      {
        data: {
          naf: {
            code: "0112Z",
            intitule: "Culture du riz",
          },
          convention_collective: null,
        },
        date_import: now,
        import_id: imports[0]._id,
      },
      {
        data: {
          naf: {
            code: "1812Z",
            intitule: "Autre imprimerie (labeur)",
          },
          convention_collective: {
            idcc: 706,
            titre: "Reprographie",
          },
        },
        date_import: now,
        import_id: imports[0]._id,
      },
    ]);
  });

  it("should skip if file is up to date", async () => {
    const scope = nock("https://dares.travail-emploi.gouv.fr");
    scope
      .get("/donnees/les-portraits-statistiques-de-branches-professionnelles")
      .reply(200, await readFile(join(fixtureDir, "article.html"), "utf-8"));
    scope
      .head("/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx")
      .reply(200, "", { "last-modified": lastMonth.toString() });

    const initialImport: IImportMetaDares = {
      _id: new ObjectId(),
      import_date: yesterday,
      type: "dares_ape_idcc",
      status: "done",
      resource: {
        date: lastMonth,
        title: "Table de passage entre la convention collective (code IDCC) et le secteur d'activité (code APE)",
        url: "https://dares.travail-emploi.gouv.fr/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx",
      },
    };

    const initialData = [
      {
        _id: new ObjectId(),
        data: {
          naf: {
            code: "0811Z",
            intitule:
              "Extraction de pierres ornementales et de construction, de calcaire industriel, de gypse, de craie et d ardoise",
          },
          convention_collective: { idcc: 135, titre: "Industries de carrières et de matériaux ETAM" },
        },
        date_import: yesterday,
        import_id: initialImport._id,
      },
      {
        _id: new ObjectId(),
        data: {
          naf: { code: "0610Z", intitule: "Extraction de pétrole brut" },
          convention_collective: null,
        },
        date_import: yesterday,
        import_id: initialImport._id,
      },
    ];

    await getDbCollection("import.meta").insertOne(initialImport);
    await getDbCollection("source.dares.ape_idcc").insertMany(initialData);

    await runDaresApeIdccImporter();

    const imports = await getDbCollection("import.meta").find({}).toArray();
    expect(imports).toEqual([initialImport]);

    const result = await getDbCollection("source.dares.ape_idcc")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    expect(result).toEqual(initialData.map(({ _id, ...d }) => ({ ...d })));
  });

  it("should update when new file", async () => {
    const scope = nock("https://dares.travail-emploi.gouv.fr");
    scope
      .get("/donnees/les-portraits-statistiques-de-branches-professionnelles")
      .reply(200, await readFile(join(fixtureDir, "article.html"), "utf-8"));
    scope
      .head("/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx")
      .reply(200, "", { "last-modified": yesterday.toString() });
    scope
      .get("/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx")
      .reply(200, createReadStream(join(fixtureDir, "sample.xlsx")), {
        "last-modified": yesterday.toString(),
      });

    const initialImport: IImportMetaDares = {
      _id: new ObjectId(),
      import_date: twoDaysAgo,
      type: "dares_ape_idcc",
      status: "done",
      resource: {
        date: twoDaysAgo,
        title: "Table de passage entre la convention collective (code IDCC) et le secteur d'activité (code APE)",
        url: "https://dares.travail-emploi.gouv.fr/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx",
      },
    };

    const initialData = [
      {
        _id: new ObjectId(),
        data: {
          naf: {
            code: "0811Z",
            intitule:
              "Extraction de pierres ornementales et de construction, de calcaire industriel, de gypse, de craie et d ardoise",
          },
          convention_collective: { idcc: 135, titre: "Industries de carrières et de matériaux ETAM" },
        },
        date_import: twoDaysAgo,
        import_id: initialImport._id,
      },
      {
        _id: new ObjectId(),
        data: {
          naf: { code: "0610Z", intitule: "Extraction de pétrole brut" },
          convention_collective: null,
        },
        date_import: twoDaysAgo,
        import_id: initialImport._id,
      },
    ];

    await getDbCollection("import.meta").insertOne(initialImport);
    await getDbCollection("source.dares.ape_idcc").insertMany(initialData);

    await runDaresApeIdccImporter();

    const imports = await getDbCollection("import.meta").find({}).toArray();
    expect(imports).toEqual([
      initialImport,
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "dares_ape_idcc",
        status: "done",
        resource: {
          date: yesterday,
          title: "Table de passage entre la convention collective (code IDCC) et le secteur d'activité (code APE)",
          url: "https://dares.travail-emploi.gouv.fr/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx",
        },
      },
    ]);

    const result = await getDbCollection("source.dares.ape_idcc")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    expect(result).toEqual([
      ...initialData.map(({ _id, ...d }) => ({ ...d })),
      {
        data: {
          naf: {
            code: "0111Z",
            intitule: "Culture de céréales (à l exception du riz), de légumineuses et de graines oléagineuses",
          },
          convention_collective: null,
        },
        date_import: now,
        import_id: imports[1]._id,
      },
      {
        data: {
          naf: {
            code: "0112Z",
            intitule: "Culture du riz",
          },
          convention_collective: null,
        },
        date_import: now,
        import_id: imports[1]._id,
      },
      {
        data: {
          naf: {
            code: "1812Z",
            intitule: "Autre imprimerie (labeur)",
          },
          convention_collective: {
            idcc: 706,
            titre: "Reprographie",
          },
        },
        date_import: now,
        import_id: imports[1]._id,
      },
    ]);
  });
});
