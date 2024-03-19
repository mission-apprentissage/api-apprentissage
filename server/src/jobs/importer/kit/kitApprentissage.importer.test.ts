import { useMongo } from "@tests/mongo.test.utils";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService";
import { getStaticFilePath } from "@/utils/getStaticFilePath";

import { runKitApprentissageImporter } from "./kitApprentissage.importer";

vi.mock("@/utils/getStaticFilePath", () => ({
  getStaticFilePath: vi.fn(),
}));

describe("runKitApprentissageImporter", () => {
  useMongo();

  beforeEach(async () => {
    vi.useFakeTimers();

    return () => vi.useRealTimers();
  });

  it("should import Kit Apprentissage source", async () => {
    const date = new Date("2023-04-08T22:00:00.000Z");
    vi.setSystemTime(date);

    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), `fixtures/sample.csv`);
    vi.mocked(getStaticFilePath).mockReturnValue(dataFixture);

    const result = await runKitApprentissageImporter();

    expect(result).toBe(10);
    expect(getStaticFilePath).toHaveBeenCalledTimes(1);
    expect(getStaticFilePath).toHaveBeenCalledWith(`kit_apprentissage/kit_apprentissage_20240119.csv`);

    const coll = getDbCollection("source.kit_apprentissage");
    const data = await coll.find({}).toArray();
    expect(data.map((datum) => ({ ...datum, _id: "ObjectId" }))).toMatchSnapshot();
  });

  it("should throw an error if importKitApprentissageSource fails", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), `fixtures/non-existing-file.csv`);
    vi.mocked(getStaticFilePath).mockReturnValue(dataFixture);

    await expect(runKitApprentissageImporter()).rejects.toThrowError(
      "import.kit_apprentissage: unable to runKitApprentissageImporter"
    );
  });
});
