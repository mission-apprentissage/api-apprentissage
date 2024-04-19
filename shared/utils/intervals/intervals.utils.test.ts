import { describe, expect, it } from "vitest";

import { substractInterval, substractIntervals } from "./intervals.utils";

const t1 = new Date("2021-01-01T00:00:00.000Z");
const t1End = new Date("2021-01-01T23:59:59.000Z");
const t2 = new Date("2021-01-02T00:00:00.000Z");
const t2End = new Date("2021-01-02T23:59:59.000Z");
const t3 = new Date("2021-01-03T00:00:00.000Z");
const t3End = new Date("2021-01-03T23:59:59.000Z");
const t4 = new Date("2021-01-04T00:00:00.000Z");
const t5 = new Date("2021-01-05T00:00:00.000Z");
const t5End = new Date("2021-01-05T23:59:59.000Z");
const t6 = new Date("2021-01-06T00:00:00.000Z");
const t6End = new Date("2021-01-06T23:59:59.000Z");
const t7 = new Date("2021-01-07T00:00:00.000Z");
const t7End = new Date("2021-01-07T23:59:59.000Z");

describe("substractInterval", () => {
  it("should support equal intervals", () => {
    const a = { start: t1, end: t2 };

    expect(substractInterval(a, a)).toEqual([]);
  });

  it("should support a.start < b.start < a.end < b.end", () => {
    const a = { start: t1, end: t2End };
    const b = { start: t2, end: t4 };

    expect(substractInterval(a, b)).toEqual([{ start: t1, end: t1End }]);
  });

  it("should support b.start < a.start < b.end < a.end", () => {
    const a = { start: t2, end: t3End };
    const b = { start: t1, end: t2End };

    expect(substractInterval(a, b)).toEqual([{ start: t3, end: t3End }]);
  });

  it("should support b.end < a.start", () => {
    const a = { start: t3, end: t3End };
    const b = { start: t1, end: t1End };

    expect(substractInterval(a, b)).toEqual([a]);
  });

  it("should support a.end < b.start", () => {
    const a = { start: t1, end: t1End };
    const b = { start: t3, end: t3End };

    expect(substractInterval(a, b)).toEqual([a]);
  });

  it("should support b.end = a.start", () => {
    const a = { start: t3, end: t3End };
    const b = { start: t1, end: t2End };

    expect(substractInterval(a, b)).toEqual([a]);
  });

  it("should support a.end = b.start", () => {
    const a = { start: t1, end: t1End };
    const b = { start: t2, end: t3End };

    expect(substractInterval(a, b)).toEqual([a]);
  });

  it("should support a.start < b.start < b.end < a.end", () => {
    const a = { start: t1, end: t3End };
    const b = { start: t2, end: t2End };

    expect(substractInterval(a, b)).toEqual([
      { start: t1, end: t1End },
      { start: t3, end: t3End },
    ]);
  });

  it("should support a.start(null) < b.start < a.end < b.end", () => {
    const a = { start: null, end: t2End };
    const b = { start: t2, end: t3End };

    expect(substractInterval(a, b)).toEqual([{ start: null, end: t1End }]);
  });

  it("should support a.start(null) = b.start(null) < a.end < b.end", () => {
    const a = { start: null, end: t2End };
    const b = { start: null, end: t3End };

    expect(substractInterval(a, b)).toEqual([]);
  });

  it("should support b.start(null) < a.start < a.end < b.end", () => {
    const a = { start: t1, end: t2End };
    const b = { start: null, end: t3End };

    expect(substractInterval(a, b)).toEqual([]);
  });

  it("should support b.start(null) < a.start < b.end < a.end", () => {
    const a = { start: t1, end: t3End };
    const b = { start: null, end: t2End };

    expect(substractInterval(a, b)).toEqual([{ start: t3, end: t3End }]);
  });

  it("should support a.start < b.start < b.end < a.end(null)", () => {
    const a = { start: t1, end: null };
    const b = { start: t2, end: t2End };

    expect(substractInterval(a, b)).toEqual([
      { start: t1, end: t1End },
      { start: t3, end: null },
    ]);
  });

  it("should support a.start < b.start < b.end = a.end(null)", () => {
    const a = { start: t1, end: null };
    const b = { start: t2, end: null };

    expect(substractInterval(a, b)).toEqual([{ start: t1, end: t1End }]);
  });

  it("should support a.start < b.start < a.end < b.end(null)", () => {
    const a = { start: t1, end: t2End };
    const b = { start: t2, end: null };

    expect(substractInterval(a, b)).toEqual([{ start: t1, end: t1End }]);
  });

  it("should support b.start < b.end < a.start < b.start", () => {
    const a = { start: t3, end: t3End };
    const b = { start: t1, end: t1End };

    expect(substractInterval(a, b)).toEqual([a]);
  });
});

describe("substractIntervals", () => {
  it("should support empty intervals", () => {
    expect(substractIntervals([], [])).toEqual([]);
  });

  it("should support a single interval", () => {
    const a = [{ start: t1, end: t2End }];
    const b = [{ start: t2, end: t3End }];

    expect(substractIntervals(a, b)).toEqual([{ start: t1, end: t1End }]);
  });

  // a: 1=======4  5=============8
  // b:   2====3    6=====7
  it("should support separate intervals", () => {
    const a = [
      { start: t1, end: t3End },
      { start: t5, end: t7End },
    ];
    const b = [
      { start: t2, end: t2End },
      { start: t6, end: t6End },
    ];

    expect(substractIntervals(a, b)).toEqual([
      { start: t1, end: t1End },
      { start: t3, end: t3End },
      { start: t5, end: t5End },
      { start: t7, end: t7End },
    ]);
  });

  it("should remove interval lower than 1 second", () => {
    const a = [{ start: new Date("2021-01-01T00:00:00"), end: new Date("2021-12-31T23:59:59.000Z") }];
    const b = [
      { start: new Date("2021-01-01T00:00:00"), end: new Date("2021-06-30T23:59:59.000Z") },
      { start: new Date("2021-07-01T00:00:00"), end: new Date("2021-12-31T23:59:59.000Z") },
    ];

    expect(substractIntervals(a, b)).toEqual([]);
  });
});
