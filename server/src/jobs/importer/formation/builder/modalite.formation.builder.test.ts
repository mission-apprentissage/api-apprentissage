import { describe, expect, it } from "vitest";

import { buildFormationModalite } from "./modalite.formation.builder.js";

describe("buildFormationModalite", () => {
  const source = {
    duree: "2",
    entierement_a_distance: false,
    annee: "1",
    bcn_mefs_10: [
      {
        mef10: "3112501421",
        modalite: {
          duree: "2",
          annee: "2",
        },
      },
    ],
  };

  const expected = {
    entierement_a_distance: false,
    duree_indicative: 2,
    annee_cycle: 1,
    mef_10: "3112501421",
  };

  it("should build modalite", () => {
    const result = buildFormationModalite(source);
    expect(result).toEqual(expected);
  });

  it('should error if "duree" is not a number', () => {
    expect(() => buildFormationModalite({ ...source, duree: "invalid" })).toThrowError("buildModalite: invalid duree");
  });

  it('should support unknown "annee"', () => {
    const result = buildFormationModalite({ ...source, annee: "X" });
    expect(result).toEqual({
      ...expected,
      annee_cycle: null,
    });
  });

  it('should error if "annee" is not a number', () => {
    expect(() => buildFormationModalite({ ...source, annee: "invalid" })).toThrowError("buildModalite: invalid annee");
  });

  it("should not set mef10 if multiple mef10 are found", () => {
    const result = buildFormationModalite({
      ...source,
      bcn_mefs_10: [
        ...source.bcn_mefs_10,
        {
          mef10: "3112501422",
          modalite: {
            duree: "2",
            annee: "2",
          },
        },
      ],
    });
    expect(result).toEqual({
      ...expected,
      mef_10: null,
    });
  });
});
