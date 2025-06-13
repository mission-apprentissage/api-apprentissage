import { describe, expect, it } from "vitest";

import { validateSIRET, zSiret, zUai } from "./organismes.primitives.js";

describe("validateSIRET", () => {
  it.each([["73282932000074", "35600000000048"]])("should validate correct luhn numbers", (siret) => {
    expect(validateSIRET(siret)).toBe(true);
  });
  it.each([["35600000009075", "35600000009093"]])("should validate LaPoste special SIRET numbers", (siret) => {
    expect(validateSIRET(siret)).toBe(true);
  });
  it.each([["50000000000000"]])("should fail with SIRET not following luhn other than LaPoste", (siret) => {
    expect(validateSIRET(siret)).toBe(false);
  });
  it.each([["35600000009090"]])("should fail with SIREN LaPoste not following own algo", (siret) => {
    expect(validateSIRET(siret)).toBe(false);
  });
});

describe("zUai", () => {
  it("should validate UAI format", () => {
    expect(zUai.safeParse("0951099D")).toEqual({ success: true, data: "0951099D" });
  });

  it("should support lowercase ", () => {
    expect(zUai.safeParse("0951099d")).toEqual({ success: true, data: "0951099D" });
  });

  it.each([["0123456"], ["0123456AA"], ["0123456A0"], ["XXX"]])("should reject UAI %s not matching format", (uai) => {
    const result = zUai.safeParse(uai);
    expect(result.success).toBe(false);
    expect(result.error?.format()).toEqual({
      _errors: ["UAI does not match the format /^\\d{1,7}[A-Z]$/"],
    });
  });

  it("should correct missing leading zeros", () => {
    expect(zUai.safeParse("951099D")).toEqual({ success: true, data: "0951099D" });
  });

  it.each([
    ["0951099D", { success: true, data: "0951099D" }],
    ["0951099C", { success: false, error: { _errors: ["UAI checksum is invalid"] } }],
  ])("should check UAI checksum", (uai, expected) => {
    const result = zUai.safeParse(uai);

    const formattedResult = result.success
      ? result
      : {
          success: false,
          error: result.error?.format(),
        };

    expect(formattedResult).toEqual(expected);
  });
});

describe("zSiret", () => {
  it("should validate SIRET format", () => {
    expect(zSiret.safeParse("98222438800016")).toEqual({ success: true, data: "98222438800016" });
  });

  it("should correct missing leading zeros", () => {
    expect(zSiret.safeParse("2408240600034")).toEqual({ success: true, data: "02408240600034" });
  });

  it.each([["73282932000074", "35600000000048"]])("should validate correct luhn numbers", (siret) => {
    expect(zSiret.safeParse(siret)).toEqual({ success: true, data: siret });
  });
  it.each([["35600000009075", "35600000009093"]])("should validate LaPoste special SIRET numbers", (siret) => {
    expect(zSiret.safeParse(siret)).toEqual({ success: true, data: siret });
  });
  it.each([["50000000000000"]])("should fail with SIRET not following luhn other than LaPoste", (siret) => {
    const result = zUai.safeParse(siret);
    expect(result.success).toBe(false);
    expect(result.error?.format()).toEqual({
      _errors: ["UAI does not match the format /^\\d{1,7}[A-Z]$/"],
    });
  });
  it.each([["35600000009090"]])("should fail with SIREN LaPoste not following own algo", (siret) => {
    const result = zUai.safeParse(siret);
    expect(result.success).toBe(false);
    expect(result.error?.format()).toEqual({
      _errors: ["UAI does not match the format /^\\d{1,7}[A-Z]$/"],
    });
  });
});
