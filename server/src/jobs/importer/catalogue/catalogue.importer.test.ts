import { Readable } from "node:stream";

import { useMongo } from "@tests/mongo.test.utils.js";
import { ObjectId } from "mongodb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchCatalogueData } from '@/services/apis/catalogue/catalogue.js';
import { fetchCatalogueEducatifData } from '@/services/apis/catalogue/catalogueEducatif.js';
import { getDbCollection } from '@/services/mongodb/mongodbService.js';

import { runCatalogueImporter } from "./catalogue.importer.js";
import {
  catalogueDataFixture,
  exceptedUaiFormation,
  generateCatalogueData,
  generateCatalogueEducatifData,
} from "./fixtures/sample.js";

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
    vi.mocked(fetchCatalogueEducatifData).mockImplementation(async () => {
      return Readable.from(generateCatalogueEducatifData());
    });

    const stats = await runCatalogueImporter();

    const coll = getDbCollection("source.catalogue");
    const data = await coll.find({}).toArray();

    expect(data.length).toBe(catalogueDataFixture.length);
    expect(data).toEqual(
      catalogueDataFixture.map((data) => ({
        data: {
          ...data,
          uai_formation: exceptedUaiFormation[data.cle_ministere_educatif],
        },
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
    vi.mocked(fetchCatalogueEducatifData).mockRejectedValue(error);

    await expect(runCatalogueImporter()).rejects.toThrowError("import.catalogue: unable to runCatalogueImporter");
  });
});
