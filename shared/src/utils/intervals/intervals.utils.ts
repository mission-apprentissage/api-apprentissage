export type Interval = Readonly<{
  start: Date | null;
  end: Date | null;
}>;

function compare(a: Date | "lowerBound" | "upperBound", b: Date | "lowerBound" | "upperBound") {
  if (a === b) {
    return 0;
  }

  if (a === "lowerBound" || b === "upperBound") {
    return -1;
  }

  if (a === "upperBound" || b === "lowerBound") {
    return 1;
  }

  const deltaSeconds = (a.getTime() - b.getTime()) / 1_000;

  if (Math.abs(deltaSeconds) < 1) {
    return 0;
  }

  return deltaSeconds;
}

function isBefore(a: Date | "lowerBound" | "upperBound", b: Date | "lowerBound" | "upperBound") {
  return compare(a, b) < 0;
}

function isOn(a: Date | "lowerBound" | "upperBound", b: Date | "lowerBound" | "upperBound") {
  return compare(a, b) === 0;
}

function isAfter(a: Date | "lowerBound" | "upperBound", b: Date | "lowerBound" | "upperBound") {
  return compare(a, b) > 0;
}

function addSecond(date: Date | null, count: number) {
  if (date === null) {
    return null;
  }

  return new Date(date.getTime() + count * 1_000);
}

export function substractInterval(a: Interval, b: Interval): Interval[] {
  const result: Interval[] = [];
  const aStart = a.start ?? "lowerBound";
  const bStart = b.start ?? "lowerBound";
  const aEnd = a.end ?? "upperBound";
  const bEnd = b.end ?? "upperBound";

  if (isBefore(bEnd, aStart) || isAfter(bStart, aEnd)) {
    return [{ start: a.start, end: a.end }];
  }

  if (isOn(aStart, bEnd)) {
    return [{ start: addSecond(a.start, 1), end: a.end }];
  }

  if (isOn(aEnd, bStart)) {
    return [{ start: a.start, end: addSecond(a.end, -1) }];
  }

  // Possible intervals are
  // - aStart --> bStart
  // - bEnd --> aEnd

  if (isBefore(aStart, bStart)) {
    result.push({
      start: a.start,
      end: addSecond(b.start, -1),
    });
  }

  if (isBefore(bEnd, aEnd)) {
    result.push({
      start: addSecond(b.end, 1),
      end: a.end,
    });
  }

  return result;
}

export function substractIntervals(a: ReadonlyArray<Interval>, b: ReadonlyArray<Interval>): ReadonlyArray<Interval> {
  if (b.length === 0) {
    return a;
  }

  // We substract the first interval of b from all intervals of a
  const [firstB, ...restB] = b;
  const substracted = a.flatMap((interval) => {
    return substractInterval(interval, firstB);
  });

  return substractIntervals(substracted, restB);
}
