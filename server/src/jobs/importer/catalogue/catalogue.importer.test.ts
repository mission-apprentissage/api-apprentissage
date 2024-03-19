import { Readable } from "node:stream";

import { useMongo } from "@tests/mongo.test.utils";
import { ObjectId } from "mongodb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchCatalogueData } from "@/services/apis/catalogue/catalogue";
import { getDbCollection } from "@/services/mongodb/mongodbService";

import { runCatalogueImporter } from "./catalogue.importer";
import { catalogueDataFixture, generateCatalogueData } from "./fixtures/sample";

vi.mock("@/services/apis/catalogue/catalogue", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    fetchCatalogueData: vi.fn(),
  };
});

describe("runBcnImporter", () => {
  useMongo();

  beforeEach(() => {
    vi.useFakeTimers();

    return () => vi.useRealTimers();
  });

  afterEach(() => {
    vi.mocked(fetchCatalogueData).mockReset();
  });

  it("should import Catalogue data", async () => {
    const date = new Date("2023-04-08T22:00:00.000Z");
    vi.setSystemTime(date);

    vi.mocked(fetchCatalogueData).mockImplementation(async () => {
      return Readable.from(generateCatalogueData());
    });

    const stats = await runCatalogueImporter();

    const coll = getDbCollection("source.catalogue");
    const data = await coll.find({}).toArray();

    expect(data.length).toBe(catalogueDataFixture.length);
    expect(data).toEqual(
      catalogueDataFixture.map((data) => ({
        data,
        _id: expect.any(ObjectId),
        date,
      }))
    );
    expect(stats).toBe(catalogueDataFixture.length);
  });

  it("should throw an error if runCatalogueImporter fails", async () => {
    const date = new Date("2023-04-18T22:00:00.000Z");
    vi.setSystemTime(date);
    const error = new Error("Unable to fetch data");

    vi.mocked(fetchCatalogueData).mockRejectedValue(error);

    await expect(runCatalogueImporter()).rejects.toThrowError("import.catalogue: unable to runCatalogueImporter");
  });
});
