import { describe, expect, it } from "vitest";

import { parisTimezoneDate, parseParisLocalDate, zParisLocalDateString } from "./date.primitives";

describe("parisTimezoneDate", () => {
  it.each([
    [{ year: 2024, month: 3, day: 31, hour: 0, minute: 0, second: 0 }, "2024-03-30T23:00:00.000Z"],
    [{ year: 2024, month: 3, day: 31, hour: 1, minute: 59, second: 59 }, "2024-03-31T00:59:59.000Z"],
    [{ year: 2024, month: 3, day: 31, hour: 3, minute: 0, second: 0 }, "2024-03-31T01:00:00.000Z"],
    [{ year: 2024, month: 7, day: 20, hour: 0, minute: 0, second: 0 }, "2024-07-19T22:00:00.000Z"],
  ])("should return the correct date", (parts, expected) => {
    expect(parisTimezoneDate(parts).toISOString()).toBe(expected);
  });
});

describe("parseParisLocalDate", () => {
  it.each([
    ["31/03/2024", undefined, "2024-03-30T23:00:00.000Z"],
    ["31/03/2024", "01:59:59", "2024-03-31T00:59:59.000Z"],
    // Le changement d'heure d'été se fait à 2h --> 3h, donc 2h n'existe pas
    ["31/03/2024", "03:00:00", "2024-03-31T01:00:00.000Z"],
    ["31/03/2024", "03:00:00", "2024-03-31T01:00:00.000Z"],
    // Le changement d'heure d'hiver se fait à 3h --> 2h, donc 2h existe deux fois (on choisi arbitrairement de favoriser l'heure d'hiver)
    ["27/10/2024", "01:59:59", "2024-10-26T23:59:59.000Z"],
    ["27/10/2024", "02:00:00", "2024-10-27T01:00:00.000Z"],
    ["27/10/2024", "02:59:59", "2024-10-27T01:59:59.000Z"],
    ["27/10/2024", "03:00:00", "2024-10-27T02:00:00.000Z"],
    ["01/01/1992", "00:00:00", "1991-12-31T23:00:00.000Z"],
    ["01/09/1996", "00:00:00", "1996-08-31T22:00:00.000Z"],
    ["31/08/2002", "23:59:59", "2002-08-31T21:59:59.000Z"],
    ["31/12/1996", "23:59:59", "1996-12-31T22:59:59.000Z"],
  ])("should return the correct date %s %s", (date, time, expected) => {
    const result = parseParisLocalDate(date, time);
    expect(result.toISOString()).toBe(expected);
  });
});

describe("zDateParisLocalDate", () => {
  it.each([
    ["31/03/2024", "2024-03-30T23:00:00.000Z"],
    ["20/07/2024", "2024-07-19T22:00:00.000Z"],
  ])("should return the correct date", (input, expected) => {
    const result = zParisLocalDateString.parse(input);
    expect(result.toISOString()).toBe(expected);
  });
});