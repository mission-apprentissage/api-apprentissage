import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { addJob } from "job-processor";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { runKitApprentissageImporter } from "./kitApprentissage.importer.js";
import { useMongo } from "@tests/mongo.test.utils.js";

import { getKitApprentissageData } from "@/services/apis/kit_apprentissage/kit_apprentissage.api.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { getStaticFilePath } from "@/utils/getStaticFilePath.js";

vi.mock("@/utils/getStaticFilePath", () => ({
  getStaticFilePath: vi.fn(),
}));

vi.mock("@/services/apis/kit_apprentissage/kit_apprentissage.api.js");

vi.mock("job-processor", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    addJob: vi.fn().mockResolvedValue(undefined),
  };
});

describe("runKitApprentissageImporter", () => {
  useMongo();

  beforeEach(async () => {
    vi.useFakeTimers();

    return () => vi.useRealTimers();
  });

  describe("Legacy files", () => {
    beforeEach(() => {
      vi.mocked(getKitApprentissageData).mockImplementation(async function* () {});
    });

    it("should import Kit Apprentissage single_file source", async () => {
      const date = new Date("2023-04-08T22:00:00.000Z");
      vi.setSystemTime(date);

      vi.mocked(getStaticFilePath).mockImplementation((path) =>
        join(dirname(fileURLToPath(import.meta.url)), `fixtures/single_file`, path)
      );

      const result = await runKitApprentissageImporter();

      expect(result).toBe(10);

      const coll = getDbCollection("source.kit_apprentissage");
      const data = await coll.find({}).toArray();
      expect(data.map((datum) => ({ ...datum, _id: "ObjectId" }))).toMatchSnapshot();

      expect(addJob).toHaveBeenCalledTimes(1);
      expect(addJob).toHaveBeenCalledWith({ name: "indicateurs:source_kit_apprentissage:update" });

      expect(await getDbCollection("import.meta").find({}).toArray()).toEqual([
        {
          _id: expect.any(Object),
          import_date: date,
          status: "done",
          type: "kit_apprentissage",
        },
      ]);
    });

    it("should import XLSX file", async () => {
      const date = new Date("2023-04-08T22:00:00.000Z");
      vi.setSystemTime(date);

      vi.mocked(getStaticFilePath).mockImplementation((path) =>
        join(dirname(fileURLToPath(import.meta.url)), `fixtures/xlsx`, path)
      );

      const result = await runKitApprentissageImporter();

      expect(result).toBe(10);

      const coll = getDbCollection("source.kit_apprentissage");
      const data = await coll.find({}).toArray();
      expect(data.map((datum) => ({ ...datum, _id: "ObjectId" }))).toMatchSnapshot();

      expect(addJob).toHaveBeenCalledTimes(1);
      expect(addJob).toHaveBeenCalledWith({ name: "indicateurs:source_kit_apprentissage:update" });

      expect(await getDbCollection("import.meta").find({}).toArray()).toEqual([
        {
          _id: expect.any(Object),
          import_date: date,
          status: "done",
          type: "kit_apprentissage",
        },
      ]);
    });

    it("should support consecutive import", async () => {
      const date1 = new Date("2023-04-08T22:00:00.000Z");
      vi.setSystemTime(date1);

      vi.mocked(getStaticFilePath).mockImplementation((path) =>
        join(dirname(fileURLToPath(import.meta.url)), `fixtures/single_file`, path)
      );

      const result = await runKitApprentissageImporter();
      expect(result).toBe(10);

      const date2 = new Date("2023-04-09T22:00:00.000Z");
      vi.setSystemTime(date2);

      const result2 = await runKitApprentissageImporter();
      expect(result2).toBe(10);

      const coll = getDbCollection("source.kit_apprentissage");
      const data = await coll.find({ date: date1 }).toArray();
      expect(data).toEqual([]);

      expect(await getDbCollection("import.meta").find({}).toArray()).toEqual([
        {
          _id: expect.any(Object),
          import_date: date1,
          status: "done",
          type: "kit_apprentissage",
        },
        {
          _id: expect.any(Object),
          import_date: date2,
          status: "done",
          type: "kit_apprentissage",
        },
      ]);
    });

    it("should throw an error if importKitApprentissageSource fails", async () => {
      const now = new Date("2023-04-08T22:00:00.000Z");
      vi.setSystemTime(now);

      const dataFixture = join(dirname(fileURLToPath(import.meta.url)), `fixtures/non-existing-file.csv`);
      vi.mocked(getStaticFilePath).mockReturnValue(dataFixture);

      await expect(runKitApprentissageImporter()).rejects.toThrowError(
        "import.kit_apprentissage: unable to runKitApprentissageImporter"
      );

      expect(addJob).toHaveBeenCalledTimes(0);
      expect(await getDbCollection("import.meta").find({}).toArray()).toEqual([
        {
          _id: expect.any(Object),
          import_date: now,
          status: "failed",
          type: "kit_apprentissage",
        },
      ]);
    });

    it("should import Kit Apprentissage multiple_files source", async () => {
      const date = new Date("2023-04-08T22:00:00.000Z");
      vi.setSystemTime(date);

      vi.mocked(getStaticFilePath).mockImplementation((path) =>
        join(dirname(fileURLToPath(import.meta.url)), `fixtures/multiple_files`, path)
      );

      const result = await runKitApprentissageImporter();

      expect(result).toBe(7);

      const coll = getDbCollection("source.kit_apprentissage");
      const stats = await coll.find({}, { projection: { _id: 0 }, sort: { cfd: 1, rncp: 1 } }).toArray();

      expect(stats).toEqual([
        {
          cfd: "17021006",
          rncp: "RNCP11532",
        },
        {
          cfd: "17021006",
          rncp: "RNCP1997",
        },
        {
          cfd: "17021006",
          rncp: "RNCP5912",
        },
        {
          cfd: "46X33608",
          rncp: "RNCP36906",
        },
        {
          cfd: "46X33608",
          rncp: "RNCP38447",
        },
        {
          cfd: "56T23207",
          rncp: "RNCP25720",
        },
        {
          cfd: "56T23207",
          rncp: "RNCP35507",
        },
      ]);

      const data = await coll.find({}).toArray();
      expect(data.map((datum) => ({ ...datum, _id: "ObjectId" }))).toMatchSnapshot();

      expect(addJob).toHaveBeenCalledTimes(1);
      expect(addJob).toHaveBeenCalledWith({ name: "indicateurs:source_kit_apprentissage:update" });

      expect(await getDbCollection("import.meta").find({}).toArray()).toEqual([
        {
          _id: expect.any(Object),
          import_date: date,
          status: "done",
          type: "kit_apprentissage",
        },
      ]);
    });

    it("should support june 2024 new sheets", async () => {
      const date = new Date("2023-04-08T22:00:00.000Z");
      vi.setSystemTime(date);

      vi.mocked(getStaticFilePath).mockImplementation((path) =>
        join(dirname(fileURLToPath(import.meta.url)), `fixtures/juin_2024`, path)
      );

      const result = await runKitApprentissageImporter();

      expect(result).toBe(1);

      const coll = getDbCollection("source.kit_apprentissage");
      const data = await coll.find({}).toArray();
      expect(data.map((datum) => ({ ...datum, _id: "ObjectId" }))).toMatchSnapshot();

      expect(addJob).toHaveBeenCalledTimes(1);
      expect(addJob).toHaveBeenCalledWith({ name: "indicateurs:source_kit_apprentissage:update" });

      expect(await getDbCollection("import.meta").find({}).toArray()).toEqual([
        {
          _id: expect.any(Object),
          import_date: date,
          status: "done",
          type: "kit_apprentissage",
        },
      ]);
    });
  });

  describe("API source", () => {
    const apiData = [
      {
        cfd: "17021006",
        rncp: "RNCP1997",
      },
      {
        cfd: "25031012",
        rncp: "RNCP30111",
      },
      {
        cfd: "46X33608",
        rncp: null,
      },
      {
        cfd: null,
        rncp: "RNCP30111",
      },
    ];

    beforeEach(() => {
      vi.mocked(getKitApprentissageData).mockImplementation(async function* () {
        for (const item of apiData) {
          yield item;
        }
      });
    });

    it("should import API source", async () => {
      const date = new Date("2023-04-08T22:00:00.000Z");
      vi.setSystemTime(date);

      vi.mocked(getStaticFilePath).mockImplementation((path) =>
        join(dirname(fileURLToPath(import.meta.url)), `fixtures/empty`, path)
      );

      const result = await runKitApprentissageImporter();

      expect(result).toBe(2);

      const coll = getDbCollection("source.kit_apprentissage");
      const data = await coll.find({}, { projection: { _id: 0 } }).toArray();
      expect(data).toEqual([apiData[0], apiData[1]]);

      expect(addJob).toHaveBeenCalledTimes(1);
      expect(addJob).toHaveBeenCalledWith({ name: "indicateurs:source_kit_apprentissage:update" });

      expect(await getDbCollection("import.meta").find({}).toArray()).toEqual([
        {
          _id: expect.any(Object),
          import_date: date,
          status: "done",
          type: "kit_apprentissage",
        },
      ]);
    });
  });
});
