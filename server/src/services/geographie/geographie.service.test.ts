import { useMongo } from "@tests/mongo.test.utils.js";
import {
  communeFixtures,
  getMissionLocaleFixtureFromSource,
  missionLocaleFixtures,
} from "shared/models/fixtures/commune.model.fixture";
import { beforeEach, describe, expect, it } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { searchMissionLocales } from "./geographie.service.js";

useMongo();

describe("searchMissionLocales", () => {
  beforeEach(async () => {
    await getDbCollection("commune").insertMany(communeFixtures);
  });

  it('should return all "mission_locale" if no filter is provided', async () => {
    const result = await searchMissionLocales({
      radius: 30,
    });
    expect.soft(result).toHaveLength(Object.keys(missionLocaleFixtures).length);
    expect.soft(result).toEqual(Object.values(missionLocaleFixtures).map(getMissionLocaleFixtureFromSource));
  });

  it('should filter by "geolocalisation" and sort by distance', async () => {
    const melun = {
      type: "Point",
      coordinates: [2.6552, 48.5421],
    };

    const data30 = await searchMissionLocales({
      radius: 30,
      longitude: melun.coordinates[0],
      latitude: melun.coordinates[1],
    });
    expect(data30).toEqual([]);

    const data40 = await searchMissionLocales({
      radius: 40,
      longitude: melun.coordinates[0],
      latitude: melun.coordinates[1],
    });
    expect(data40).toEqual([getMissionLocaleFixtureFromSource(missionLocaleFixtures[374])]);

    const data50 = await searchMissionLocales({
      radius: 50,
      longitude: melun.coordinates[0],
      latitude: melun.coordinates[1],
    });
    expect(data50).toEqual([
      getMissionLocaleFixtureFromSource(missionLocaleFixtures[374]),
      getMissionLocaleFixtureFromSource(missionLocaleFixtures[226]),
    ]);
  });
});
