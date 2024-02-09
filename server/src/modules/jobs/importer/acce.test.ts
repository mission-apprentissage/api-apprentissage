import { useMongo } from "@tests/utils/mongo.utils";
import { createReadStream } from "fs";
import { dirname, join } from "path";
import { IAcce } from "shared/models/source/acce/acce.model";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { getDbCollection } from "../../../common/utils/mongodbUtils";
import { importAcceData } from "./acce";

const mongo = useMongo();

describe("importAcceData", () => {
  beforeAll(async () => {
    await mongo.beforeAll();
  });

  beforeEach(async () => {
    await mongo.beforeEach();
    vi.useFakeTimers();
  });

  afterAll(async () => {
    vi.useRealTimers();
    await mongo.afterAll();
  });

  it("should extract zipped acce data", async () => {
    const date = new Date(2023, 3, 9);
    vi.setSystemTime(date);

    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/acce_data.zip");
    const s = createReadStream(dataFixture);

    const coll = getDbCollection("source.acce");
    const getData = async (source: IAcce["source"]) => {
      const data = await coll.find({ source }).toArray();
      return data.map((datum) => ({ ...datum, _id: "ObjectId" }));
    };

    await importAcceData(s);
    expect(await getData("ACCE_UAI.csv")).toMatchSnapshot();
    expect(await getData("ACCE_UAI_ZONE.csv")).toMatchSnapshot();
    expect(await getData("ACCE_UAI_SPEC.csv")).toMatchSnapshot();
    expect(await getData("ACCE_UAI_MERE.csv")).toMatchSnapshot();
    expect(await getData("ACCE_UAI_FILLE.csv")).toMatchSnapshot();
  });

  it("should replace old data every time", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/acce_data.zip");

    const date1 = new Date(2023, 3, 9);
    vi.setSystemTime(date1);

    const s1 = createReadStream(dataFixture);
    await importAcceData(s1);
    const data1 = await getDbCollection("source.acce").find({}).toArray();
    expect(data1).toHaveLength(25);
    expect(data1[0].date).toEqual(date1);

    const date2 = new Date(2024, 3, 10);
    vi.setSystemTime(date2);

    const s2 = createReadStream(dataFixture);
    await importAcceData(s2);
    const data2 = await getDbCollection("source.acce").find({}).toArray();
    expect(data2).toHaveLength(25);
    expect(data2[0].date).toEqual(date2);
  });
});
