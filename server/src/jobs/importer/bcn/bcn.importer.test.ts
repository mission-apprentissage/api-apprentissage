import { createReadStream } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { addJob } from "job-processor";
import type { ISourceBcn } from "shared/models/source/bcn/source.bcn.model";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runBcnImporter } from "./bcn.importer.js";
import { fetchBcnData } from "@/services/apis/bcn/bcn.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { useMongo } from "@tests/mongo.test.utils.js";

vi.mock("@/services/apis/bcn/bcn", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    fetchBcnData: vi.fn(),
  };
});

vi.mock("job-processor", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    addJob: vi.fn().mockResolvedValue(undefined),
  };
});

describe("runBcnImporter", () => {
  useMongo();

  afterEach(() => {
    vi.mocked(fetchBcnData).mockReset();
  });

  beforeEach(() => {
    vi.useFakeTimers();

    return () => vi.useRealTimers();
  });

  it("should import Bcn sources", async () => {
    const date = new Date("2023-04-08T22:00:00.000Z");
    vi.setSystemTime(date);

    vi.mocked(fetchBcnData).mockImplementation(async (source: ISourceBcn["source"]) => {
      const dataFixture = join(dirname(fileURLToPath(import.meta.url)), `fixtures/sample/${source}.csv`);
      return createReadStream(dataFixture);
    });

    const stats = await runBcnImporter();

    const coll = getDbCollection("source.bcn");
    const data = await coll.find({}).toArray();

    expect(data.length).toBe(40);
    expect(
      data.map((datum) => ({ ...datum, _id: "ObjectId" })).filter((datum) => datum.source === "N_FORMATION_DIPLOME")
    ).toMatchSnapshot();
    expect(
      data
        .map((datum) => ({ ...datum, _id: "ObjectId" }))
        .filter((datum) => datum.source === "N_FORMATION_DIPLOME_ENQUETE_51")
    ).toMatchSnapshot();
    expect(
      data
        .map((datum) => ({ ...datum, _id: "ObjectId" }))
        .filter((datum) => datum.source === "N_NIVEAU_FORMATION_DIPLOME")
    ).toMatchSnapshot();
    expect(
      data.map((datum) => ({ ...datum, _id: "ObjectId" })).filter((datum) => datum.source === "V_FORMATION_DIPLOME")
    ).toMatchSnapshot();

    expect(fetchBcnData).toHaveBeenCalledTimes(4);
    expect(fetchBcnData).toHaveBeenNthCalledWith(1, "N_FORMATION_DIPLOME");
    expect(fetchBcnData).toHaveBeenNthCalledWith(2, "N_FORMATION_DIPLOME_ENQUETE_51");
    expect(fetchBcnData).toHaveBeenNthCalledWith(3, "N_NIVEAU_FORMATION_DIPLOME");
    expect(fetchBcnData).toHaveBeenNthCalledWith(4, "V_FORMATION_DIPLOME");
    expect(stats).toEqual({
      N_FORMATION_DIPLOME: 11,
      N_FORMATION_DIPLOME_ENQUETE_51: 9,
      N_NIVEAU_FORMATION_DIPLOME: 9,
      V_FORMATION_DIPLOME: 11,
      INDICATEUR_CONTINUITE: { anciens: 1, nouveaux: 1 },
    });
    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith({ name: "indicateurs:source_kit_apprentissage:update" });
  });

  it("should throw an error if importBcnSource fails", async () => {
    const date = new Date("2023-04-18T22:00:00.000Z");
    vi.setSystemTime(date);
    const error = new Error("Unable to fetch data");

    vi.mocked(fetchBcnData).mockRejectedValue(error);

    await expect(runBcnImporter()).rejects.toThrowError("import.bcn: unable to runBcnImporter");
    expect(fetchBcnData).toHaveBeenCalledTimes(1);
    expect(fetchBcnData).toHaveBeenNthCalledWith(1, "N_FORMATION_DIPLOME");
    expect(addJob).toHaveBeenCalledTimes(0);
  });
});
