import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb";
import { sourceUnmlResultsFixtures } from "shared/models/fixtures/commune.model.fixture";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { zSourceUnmlPayload } from "shared";
import { runMissionLocaleImporter } from "./mission_locale.importer.js";
import { useMongo } from "@tests/mongo.test.utils.js";

import { fetchDepartementMissionLocale } from "@/services/apis/unml/unml.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { getStaticFilePath } from "@/utils/getStaticFilePath.js";

useMongo();

vi.mock("@/utils/getStaticFilePath", () => ({
  getStaticFilePath: vi.fn(),
}));
vi.mock("@/services/apis/unml/unml.js");

describe("runMissionLocaleImporter", () => {
  const now = new Date("2024-10-03T21:53:08.141Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    return () => vi.useRealTimers();
  });

  it("should import initial ml", async () => {
    vi.mocked(getStaticFilePath).mockImplementation((url) => {
      switch (url) {
        case "mission_locales/zones_de_couverture_janvier_2026.csv":
          return join(dirname(fileURLToPath(import.meta.url)), `fixtures/couverture.csv`);
        case "mission_locales/geopoints_mission_locale.csv":
          return join(dirname(fileURLToPath(import.meta.url)), `fixtures/geopoints.csv`);
        default:
          throw new Error(`Unexpected call to getStaticFilePath with url=${url}`);
      }
    });
    vi.mocked(fetchDepartementMissionLocale).mockImplementation(async (codeDepartement: string) =>
      zSourceUnmlPayload.parse(sourceUnmlResultsFixtures[codeDepartement as keyof typeof sourceUnmlResultsFixtures])
    );

    await runMissionLocaleImporter();
    expect(fetchDepartementMissionLocale).toHaveBeenCalledTimes(4);

    const sources = await getDbCollection("source.insee_to_ml").find({}).toArray();

    expect(
      sources.map(({ _id, import_id, ...rest }) => rest).toSorted((a, b) => a.code_insee.localeCompare(b.code_insee))
    ).toMatchSnapshot();

    const importMetas = await getDbCollection("import.meta").find().toArray();

    expect(importMetas).toEqual([
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "mission_locale",
        status: "done",
      },
    ]);
  });
});
