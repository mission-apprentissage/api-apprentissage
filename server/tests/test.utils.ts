import { expect } from "vitest"

type Primitive = string | number | boolean | null | undefined

type DeepCloseTo<T> =
  T extends number ? number :
  T extends Primitive ? T :
  T extends Array<infer U> ? Array<DeepCloseTo<U>> :
  { [K in keyof T]: DeepCloseTo<T[K]> }

/**
 * Recursively compares two objects, allowing for numerical values to be compared with a specified precision.
 * @param received The object received from the test subject.
 * @param expected The expected object structure with numerical values to compare.
 * @param precision The number of decimal places to use for numerical comparisons.
 */
export function expectCloseToObject<T>(
  received: unknown,
  expected: DeepCloseTo<T>,
  precision = 4
): void {
  const buildMatcher = (value: any): any => {
    if (typeof value === "number") return expect.closeTo(value, precision)
    if (Array.isArray(value)) return value.map(buildMatcher)
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, buildMatcher(v)])
      )
    }
    return value
  }

  expect(received).toEqual(buildMatcher(expected))
}
