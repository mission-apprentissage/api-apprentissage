import { describe, it, expect } from "vitest";

import { joinNonNullStrings } from "./stringUtils";

describe("stringUtils", () => {
  describe("joinNonNullStrings", () => {
    it("should return a single trimmed string when all values are non-null", () => {
      expect(joinNonNullStrings([" Hello ", "world ", "Vitest"])).toBe("Hello world Vitest");
    });

    it("should ignore null values and return a single trimmed string", () => {
      expect(joinNonNullStrings([" Hello ", null, "world", " ", null])).toBe("Hello world");
    });

    it("should return null if all values are null", () => {
      expect(joinNonNullStrings([null, null, null])).toBe(null);
    });

    it("should return null if array is empty", () => {
      expect(joinNonNullStrings([])).toBe(null);
    });

    it("should handle an array with mixed whitespace and nulls correctly", () => {
      expect(joinNonNullStrings(["  ", null, " Hello ", " ", null, "world"])).toBe("Hello world");
    });

    it("should return a single word if only one non-null value is present", () => {
      expect(joinNonNullStrings([null, " Vitest ", null])).toBe("Vitest");
    });
  })
})
