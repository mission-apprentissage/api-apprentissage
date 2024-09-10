import { useMongo } from "@tests/mongo.test.utils.js";
import { createReadStream } from "fs";
import { dirname, join } from "path";
import type { ISourceAcce } from "shared/models/source/acce/source.acce.model";
import { fileURLToPath } from "url";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { importAcceData } from "./acce.js";

describe("importAcceData", () => {
  useMongo();

  beforeEach(() => {
    vi.useFakeTimers();

    return () => vi.useRealTimers();
  });

  it("should extract zipped acce data", async () => {
    const date = new Date("2023-04-08T22:00:00.000Z");
    vi.setSystemTime(date);

    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/acce_data.zip");
    const s = createReadStream(dataFixture);

    const coll = getDbCollection("source.acce");
    const getData = async (source: ISourceAcce["source"]) => {
      const data = await coll.find({ source }).toArray();
      return data.map((datum) => ({ ...datum, _id: "ObjectId" }));
    };

    await importAcceData(s, date);
    expect(await getData("ACCE_UAI.csv")).toMatchSnapshot();
    expect(await getData("ACCE_UAI_ZONE.csv")).toMatchSnapshot();
    expect(await getData("ACCE_UAI_SPEC.csv")).toMatchSnapshot();
    expect(await getData("ACCE_UAI_MERE.csv")).toMatchSnapshot();
    expect(await getData("ACCE_UAI_FILLE.csv")).toMatchSnapshot();
  });

  it("should replace old data every time", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/acce_data.zip");

    const date1 = new Date("2023-04-08T22:00:00.000Z");
    vi.setSystemTime(date1);

    const s1 = createReadStream(dataFixture);
    await importAcceData(s1, date1);
    const data1 = await getDbCollection("source.acce").find({}).toArray();
    expect(data1).toHaveLength(25);
    expect(data1[0].date).toEqual(date1);

    const date2 = new Date("2023-04-10T22:00:00.000Z");
    vi.setSystemTime(date2);

    const s2 = createReadStream(dataFixture);
    await importAcceData(s2, date2);
    const data2 = await getDbCollection("source.acce").find({}).toArray();
    expect(data2).toHaveLength(25);
    expect(data2[0].date).toEqual(date2);
  });
});
