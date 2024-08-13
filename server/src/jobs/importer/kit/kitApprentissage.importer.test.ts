import { useMongo } from "@tests/mongo.test.utils.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { getStaticFilePath } from "@/utils/getStaticFilePath.js";

import { runKitApprentissageImporter } from "./kitApprentissage.importer.js";

vi.mock("@/utils/getStaticFilePath", () => ({
  getStaticFilePath: vi.fn(),
}));

describe("runKitApprentissageImporter", () => {
  useMongo();

  beforeEach(async () => {
    vi.useFakeTimers();

    return () => vi.useRealTimers();
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
  });

  it("should throw an error if importKitApprentissageSource fails", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), `fixtures/non-existing-file.csv`);
    vi.mocked(getStaticFilePath).mockReturnValue(dataFixture);

    await expect(runKitApprentissageImporter()).rejects.toThrowError(
      "import.kit_apprentissage: unable to runKitApprentissageImporter"
    );
  });

  it("should import Kit Apprentissage multiple_files source", async () => {
    const date = new Date("2023-04-08T22:00:00.000Z");
    vi.setSystemTime(date);

    vi.mocked(getStaticFilePath).mockImplementation((path) =>
      join(dirname(fileURLToPath(import.meta.url)), `fixtures/multiple_files`, path)
    );

    const result = await runKitApprentissageImporter();

    expect(result).toBe(50);

    const coll = getDbCollection("source.kit_apprentissage");
    const stats = await coll
      .aggregate([
        {
          $group: {
            _id: { cfd: "$data.Code Diplôme", rncp: "$data.FicheRNCP" },
            sources: {
              $addToSet: "$source",
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.cfd": 1, "_id.rncp": 1 },
        },
        {
          $project: {
            _id: 1,
            count: 1,
            sources: {
              $sortArray: {
                input: "$sources",
                sortBy: 1,
              },
            },
          },
        },
      ])
      .toArray();

    expect(stats).toEqual([
      {
        _id: {
          cfd: "17021006",
          rncp: "RNCP11532",
        },
        count: 31,
        sources: [
          "Kit apprentissage et RNCP v1.0.csv",
          "Kit apprentissage et RNCP v1.1.csv",
          "Kit apprentissage et RNCP v1.2.csv",
          "Kit apprentissage et RNCP v1.3.csv",
          "Kit apprentissage et RNCP v1.4.csv",
          "Kit apprentissage et RNCP v1.5.csv",
          "Kit apprentissage et RNCP v1.6.csv",
          "Kit apprentissage et RNCP v1.7.csv",
          "Kit apprentissage et RNCP v1.8.csv",
          "Kit apprentissage et RNCP v1.9.csv",
          "Kit apprentissage et RNCP v2.0.csv",
          "Kit apprentissage et RNCP v2.1.csv",
          "Kit apprentissage et RNCP v2.2.csv",
          "Kit apprentissage et RNCP v2.3.csv",
          "Kit apprentissage et RNCP v2.4.csv",
          "Kit apprentissage et RNCP v2.5.csv",
          "Kit apprentissage et RNCP v2.6.csv",
          "Kit apprentissage et RNCP v2.7.csv",
          "Kit apprentissage et RNCP v2.8.csv",
          "Kit apprentissage et RNCP v2.9.csv",
          "Kit apprentissage et RNCP v3.0.csv",
          "Kit_apprentissage_20240119.csv",
          "Kit_apprentissage_20240223.csv",
          "Kit_apprentissage_20240329.csv",
        ],
      },
      {
        _id: {
          cfd: "17021006",
          rncp: "RNCP1997",
        },
        count: 3,
        sources: [
          "Kit apprentissage et RNCP v1.0.csv",
          "Kit apprentissage et RNCP v1.1.csv",
          "Kit apprentissage et RNCP v1.2.csv",
        ],
      },
      {
        _id: {
          cfd: "17021006",
          rncp: "RNCP5912",
        },
        count: 3,
        sources: [
          "Kit apprentissage et RNCP v1.0.csv",
          "Kit apprentissage et RNCP v1.1.csv",
          "Kit apprentissage et RNCP v1.2.csv",
        ],
      },
      {
        _id: {
          cfd: "46X33608",
          rncp: "RNCP36906",
        },
        count: 2,
        sources: ["Kit apprentissage et RNCP v2.9.csv", "Kit apprentissage et RNCP v3.0.csv"],
      },
      {
        _id: {
          cfd: "46X33608",
          rncp: "RNCP38447",
        },
        count: 3,
        sources: ["Kit_apprentissage_20240119.csv", "Kit_apprentissage_20240223.csv", "Kit_apprentissage_20240329.csv"],
      },
      {
        _id: {
          cfd: "56T23207",
          rncp: "RNCP25720",
        },
        count: 3,
        sources: [
          "Kit apprentissage et RNCP v1.3.csv",
          "Kit apprentissage et RNCP v1.4.csv",
          "Kit apprentissage et RNCP v1.5.csv",
        ],
      },
      {
        _id: {
          cfd: "56T23207",
          rncp: "RNCP35507",
        },
        count: 5,
        sources: [
          "Kit apprentissage et RNCP v1.6.csv",
          "Kit apprentissage et RNCP v1.7.csv",
          "Kit apprentissage et RNCP v1.8.csv",
          "Kit apprentissage et RNCP v1.9.csv",
          "Kit apprentissage et RNCP v2.0.csv",
        ],
      },
    ]);

    const data = await coll.find({}).toArray();
    expect(data.map((datum) => ({ ...datum, _id: "ObjectId" }))).toMatchSnapshot();
  });
});
