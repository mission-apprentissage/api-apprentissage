import { Readable } from "node:stream";

import { ObjectId } from "mongodb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCatalogueImporter } from "./catalogue.importer.js";
import { catalogueDataFixture, generateCatalogueData } from "./fixtures/sample.js";
import { useMongo } from "@tests/mongo.test.utils.js";

import { fetchCatalogueData } from "@/services/apis/catalogue/catalogue.js";
import { fetchCatalogueEducatifData } from "@/services/apis/catalogue/catalogueEducatif.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

vi.mock("@/services/apis/catalogue/catalogue", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    fetchCatalogueData: vi.fn(),
  };
});
vi.mock("@/services/apis/catalogue/catalogueEducatif", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    fetchCatalogueEducatifData: vi.fn(),
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
    vi.mocked(fetchCatalogueEducatifData).mockReset();
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
        data: data,
        _id: expect.any(ObjectId),
        date,
      }))
    );
    expect(fetchCatalogueEducatifData).toHaveBeenCalledTimes(0);
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
