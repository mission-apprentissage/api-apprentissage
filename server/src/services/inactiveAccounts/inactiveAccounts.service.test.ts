import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateUserFixture } from "shared/models/fixtures/user.model.fixture";
import { useMongo } from "../../../tests/mongo.test.utils.js";
import { getDbCollection } from "../mongodb/mongodbService.js";
import { removeInactiveAccounts } from "./inactiveAccounts.service.js";

useMongo();

const now = new Date("2023-10-01T00:00:00Z");
const twoYearsAgo = new Date("2021-10-01T00:00:00Z");
const lastWeek = new Date("2023-09-24T00:00:00Z");
const ago23Months = new Date("2021-11-01T00:00:00Z");
const ago25Months = new Date("2021-09-01T00:00:00Z");

describe("Inactive Accounts Service", () => {
  const userActiveLastWeek = generateUserFixture({
    email: "last_week@exemple.fr",
    updated_at: lastWeek,
  });
  const userActiveTwoYearsAgo = generateUserFixture({
    email: "two_years@exemple.fr",
    updated_at: twoYearsAgo,
  });
  const userActive23Months = generateUserFixture({
    email: "23_months@exemple.fr",
    updated_at: ago23Months,
  });
  const userActive25Months = generateUserFixture({
    email: "25_months@exemple.fr",
    updated_at: ago25Months,
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    await getDbCollection("users").insertMany([
      userActiveLastWeek,
      userActiveTwoYearsAgo,
      userActive23Months,
      userActive25Months,
    ]);

    return () => {
      vi.useRealTimers();
    };
  });

  it("should remove inactive accounts after 2 years", async () => {
    // Call the function
    await removeInactiveAccounts();

    const users = await getDbCollection("users")
      .find({}, { projection: { email: 1, _id: 0 } })
      .toArray();
    expect(users).toEqual([{ email: userActiveLastWeek.email }, { email: userActive23Months.email }]);
  });
});
