import { expect, it } from "vitest";

import { removeDiacritics } from "./diacritics";

it("should remove diacritics from a string", () => {
  const input = "Café";
  const expected = "Cafe";
  const result = removeDiacritics(input);
  expect(result).toBe(expected);
});

it("should remove diacritics from an empty string", () => {
  const input = "";
  const expected = "";
  const result = removeDiacritics(input);
  expect(result).toBe(expected);
});

it("should remove diacritics from a string with multiple diacritic characters", () => {
  const input = "éàôü";
  const expected = "eaou";
  const result = removeDiacritics(input);
  expect(result).toBe(expected);
});

it("should not modify a string without diacritics", () => {
  const input = "Hello World";
  const expected = "Hello World";
  const result = removeDiacritics(input);
  expect(result).toBe(expected);
});
