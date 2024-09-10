import { useMongo } from "@tests/mongo.test.utils.js";
import { createReadStream } from "fs";
import { ObjectId } from "mongodb";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { dirname, join } from "path";
import type { IDataGouvDataset } from "shared";
import type { IImportMeta } from "shared/models/import.meta.model";
import { fileURLToPath } from "url";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchDataGouvDataSet } from "@/services/apis/data_gouv/data_gouv.api.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { runKaliConventionCollectivesImporter } from "./kali.ccn.importer.js";

vi.mock("@/services/apis/data_gouv/data_gouv.api", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    fetchDataGouvDataSet: vi.fn(),
  };
});

describe("runConventionCollectivesImporter", () => {
  useMongo();

  const now = new Date("2024-06-14T09:00:07.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    disableNetConnect();

    return () => {
      vi.mocked(fetchDataGouvDataSet).mockReset();
      vi.useRealTimers();
      cleanAll();
      enableNetConnect();
    };
  });

  it("should import ccn data", async () => {
    const ccnResource = {
      created_at: new Date("2023-05-02T16:44:08.913000+00:00"),
      id: "02b67492-5243-44e8-8dd1-0cb3f90f35ff",
      last_modified: new Date("2023-03-06T15:14:03+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/02b67492-5243-44e8-8dd1-0cb3f90f35ff",
      title: "Liste des conventions collectives",
    };
    const otherResource = {
      created_at: new Date("2017-09-04T16:34:48.090000+00:00"),
      id: "c35c7767-335f-4f25-80d8-2d327a30a922",
      last_modified: new Date("2017-08-28T16:54:05+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/c35c7767-335f-4f25-80d8-2d327a30a922",
      title: "Présentation de KALI",
    };

    const dataset: IDataGouvDataset = {
      id: "53ba5033a3a729219b7bead9",
      title: "KALI : Conventions collectives nationales",
      resources: [ccnResource, otherResource],
    };

    vi.mocked(fetchDataGouvDataSet).mockResolvedValue(dataset);

    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/sample.xlsx");

    nock("https://www.data.gouv.fr/fr")
      .get(`/datasets/r/02b67492-5243-44e8-8dd1-0cb3f90f35ff`)
      .reply(200, createReadStream(dataFixture));

    const initialImports: IImportMeta[] = [
      {
        _id: new ObjectId(),
        import_date: new Date("2024-06-13T09:00:07.000Z"),
        type: "kali_ccn",
        status: "done",
      },
    ];

    await getDbCollection("import.meta").insertMany(initialImports);
    await getDbCollection("source.kali.ccn").insertMany([
      {
        _id: new ObjectId("666c3f138a5c98c03c14e94b"),
        date_import: new Date("2024-06-14T13:01:06.644Z"),
        data: {
          type: "TI",
          id: "KALICONT000046660537",
          titre:
            "Accord professionnel du 21 juillet 2022 relatif à la reconversion ou la promotion par l'alternance « Pro-A »",
          nature: "ACCORD PROFESSIONNEL",
          etat: "VIGUEUR_ETEN",
          debut: new Date("2022-11-25T23:00:00.000Z"),
          fin: null,
          url: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000046660537",
        },
      },
      {
        _id: new ObjectId("666c3f138a5c98c03c14e957"),
        date_import: new Date("2024-06-14T13:01:06.644Z"),
        data: {
          type: "IDCC",
          id: "KALICONT000044617302",
          idcc: 3237,
          titre:
            "Convention collective nationale des métiers du commerce de détail alimentaire spécialisé du 12 janvier 2021 - Etendue par arrêté du 17 septembre 2021 JORF 23 décembre 2021",
          nature: "CONVENTION COLLECTIVE NATIONALE",
          etat: "VIGUEUR_ETEN",
          debut: new Date("2021-12-31T23:00:00.000Z"),
          fin: null,
          url: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000044617302",
        },
      },
    ]);

    await runKaliConventionCollectivesImporter();

    await expect(getDbCollection("import.meta").find({}).toArray()).resolves.toEqual([
      ...initialImports,
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "kali_ccn",
        status: "done",
      },
    ]);

    const result = await getDbCollection("source.kali.ccn")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    expect(result).toMatchSnapshot();
  });
});
