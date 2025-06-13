import { ObjectId } from "mongodb";
import { generateUserFixture } from "shared/models/fixtures/user.model.fixture";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { notifyUsersAboutExpiringApiKeys } from "./apiKeyExpiration.notifier.js";
import { sendEmail } from "@/services/mailer/mailer.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { useMongo } from "@tests/mongo.test.utils.js";

useMongo();

vi.mock("@/services/mailer/mailer.js");

const now = new Date("2025-05-22T16:46:00Z");
const in15Days = new Date("2025-06-06T00:00:00Z");
const in30Days = new Date("2025-06-21T00:00:00Z");
const in2Months = new Date("2025-07-22T00:00:00Z");
const ago1Year = new Date("2024-05-22T16:46:00Z");

const DAY = 1000 * 60 * 60 * 24;

describe("ApiKeyExpirationNotifier", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    return () => {
      vi.useRealTimers();
    };
  });

  const userOk = generateUserFixture({
    email: "ok@exemple.fr",
    api_keys: [
      {
        _id: new ObjectId(),
        name: "in-2-months",
        expires_at: in2Months,
        created_at: ago1Year,
        last_used_at: null,
        expiration_warning_sent: null,
        key: "value",
      },
    ],
  });

  const userExpireIn30Days = generateUserFixture({
    email: "expire30Days@exemple.fr",
    api_keys: [
      {
        _id: new ObjectId(),
        name: "in-30-days",
        expires_at: in30Days,
        created_at: ago1Year,
        last_used_at: null,
        expiration_warning_sent: null,
        key: "value",
      },
    ],
  });

  const userMultiKeys = generateUserFixture({
    email: "multiKeys@exemple.fr",
    api_keys: [
      {
        _id: new ObjectId(),
        name: "in-30-days",
        expires_at: in30Days,
        created_at: ago1Year,
        last_used_at: null,
        expiration_warning_sent: null,
        key: "value",
      },
      {
        _id: new ObjectId(),
        name: "in-15-days",
        expires_at: in15Days,
        created_at: ago1Year,
        last_used_at: null,
        expiration_warning_sent: null,
        key: "value",
      },
      {
        _id: new ObjectId(),
        name: "in-2-months",
        expires_at: in2Months,
        created_at: ago1Year,
        last_used_at: null,
        expiration_warning_sent: null,
        key: "value",
      },
    ],
  });

  it("should not notify user with all keys valid for the next 30 days", async () => {
    await getDbCollection("users").insertOne(userOk);

    await notifyUsersAboutExpiringApiKeys(AbortSignal.timeout(1000));

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("should notify user once when expires within 30 days, then once within 15 days", async () => {
    await getDbCollection("users").insertOne(userExpireIn30Days);

    await notifyUsersAboutExpiringApiKeys(AbortSignal.timeout(1000));

    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledWith({
      name: "api-key-will-expire",
      days_left: 30,
      key_name: "in-30-days",
      to: userExpireIn30Days.email,
      expires_at: {
        en: "Saturday, June 21, 2025",
        fr: "samedi 21 juin 2025",
      },
    });

    expect(await getDbCollection("users").findOne({ _id: userExpireIn30Days._id })).toEqual({
      ...userExpireIn30Days,
      api_keys: [
        {
          ...userExpireIn30Days.api_keys[0],
          expiration_warning_sent: "30-days",
        },
      ],
    });

    vi.advanceTimersByTime(14 * DAY);

    await notifyUsersAboutExpiringApiKeys(AbortSignal.timeout(1000));
    // No additional call
    expect(sendEmail).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(DAY);

    await notifyUsersAboutExpiringApiKeys(AbortSignal.timeout(1000));
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenNthCalledWith(2, {
      name: "api-key-will-expire",
      days_left: 15,
      key_name: "in-30-days",
      to: userExpireIn30Days.email,
      expires_at: {
        en: "Saturday, June 21, 2025",
        fr: "samedi 21 juin 2025",
      },
    });

    expect(await getDbCollection("users").findOne({ _id: userExpireIn30Days._id })).toEqual({
      ...userExpireIn30Days,
      api_keys: [
        {
          ...userExpireIn30Days.api_keys[0],
          expiration_warning_sent: "15-days",
        },
      ],
    });

    vi.advanceTimersByTime(30 * DAY);

    await notifyUsersAboutExpiringApiKeys(AbortSignal.timeout(1000));
    // Last notification
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it("should support multi-keys user", async () => {
    await getDbCollection("users").insertOne(userMultiKeys);

    await notifyUsersAboutExpiringApiKeys(AbortSignal.timeout(1000));

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenNthCalledWith(1, {
      name: "api-key-will-expire",
      days_left: 30,
      key_name: "in-30-days",
      to: userMultiKeys.email,
      expires_at: {
        en: "Saturday, June 21, 2025",
        fr: "samedi 21 juin 2025",
      },
    });
    expect(sendEmail).toHaveBeenNthCalledWith(2, {
      name: "api-key-will-expire",
      days_left: 15,
      key_name: "in-15-days",
      to: userMultiKeys.email,
      expires_at: {
        en: "Friday, June 6, 2025",
        fr: "vendredi 6 juin 2025",
      },
    });

    expect(await getDbCollection("users").findOne({ _id: userMultiKeys._id })).toEqual({
      ...userMultiKeys,
      api_keys: [
        {
          ...userMultiKeys.api_keys[0],
          expiration_warning_sent: "30-days",
        },
        {
          ...userMultiKeys.api_keys[1],
          expiration_warning_sent: "15-days",
        },
        userMultiKeys.api_keys[2],
      ],
    });

    await notifyUsersAboutExpiringApiKeys(AbortSignal.timeout(1000));
    // No additional call
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });
});
