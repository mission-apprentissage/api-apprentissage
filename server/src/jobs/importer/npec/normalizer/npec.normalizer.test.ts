import { useMongo } from "@tests/mongo.test.utils";
import { generateNpecFixture } from "shared/models/fixtures";
import { describe, expect, it } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService";

import { buildCpneIdccMap } from "./npec.normalizer";

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
        ["2", new Set(["478"])],
        ["4", new Set(["1801", "1802"])],
        ["5", new Set(["2205"])],
      ])
    );
  });
});
