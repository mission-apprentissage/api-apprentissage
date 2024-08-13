import { describe, expect, it } from "vitest";

import { ParisDate } from "./date.primitives.js";

describe("ParisDate", () => {
  it.each([
    [new Date("2024-03-30T23:00:00.000Z"), "2024-03-31T00:00:00.000+01:00"],
    [new Date("2023-08-31T22:00:00.000+00:00"), "2023-09-01T00:00:00.000+02:00"],
  ])("should return the correct date", (utc, expected) => {
    expect(ParisDate.fromDate(utc).toJSON()).toBe(expected);
  });
});
