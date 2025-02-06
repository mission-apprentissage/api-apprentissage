import { describe, expect, it } from "vitest";

import { buildKitApprentissageEntry } from "./kit_apprentissage.builder.js";

const kitApprentissageSourceMap = {
  v1_0: "Kit apprentissage et RNCP v1.0.csv",
  v1_1: "Kit apprentissage et RNCP v1.1.csv",
  v1_2: "Kit apprentissage et RNCP v1.2.csv",
  v1_3: "Kit apprentissage et RNCP v1.3.csv",
  v1_4: "Kit apprentissage et RNCP v1.4.csv",
  v1_5: "Kit apprentissage et RNCP v1.5.csv",
  v1_6: "Kit apprentissage et RNCP v1.6.csv",
  v1_7: "Kit apprentissage et RNCP v1.7.csv",
  v1_8: "Kit apprentissage et RNCP v1.8.csv",
  v1_9: "Kit apprentissage et RNCP v1.9.csv",
  v2_0: "Kit apprentissage et RNCP v2.0.csv",
  v2_1: "Kit apprentissage et RNCP v2.1.csv",
  v2_2: "Kit apprentissage et RNCP v2.2.csv",
  v2_3: "Kit apprentissage et RNCP v2.3.csv",
  v2_4: "Kit apprentissage et RNCP v2.4.csv",
  v2_5: "Kit apprentissage et RNCP v2.5.csv",
  v2_6: "Kit apprentissage et RNCP v2.6.csv",
  v2_7: "Kit apprentissage et RNCP v2.7.csv",
  v2_8: "Kit apprentissage et RNCP v2.8.csv",
  v2_9: "Kit apprentissage et RNCP v2.9.csv",
  v3_0: "Kit apprentissage et RNCP v3.0.csv",
  20240119: "Kit_apprentissage_20240119.csv",
  20240223: "Kit_apprentissage_20240223.csv",
  20240329: "Kit_apprentissage_20240329.csv",
};

describe("Kit Apprentissage Builder", () => {
  it.each([
    ["RNCP12803?"],
    ["RNCP187485"],
    ["RNCP24544"],
    ["RNCP28378"],
    ["RNCP29839"],
    ["RNCP30348"],
    ["RNCP30387?"],
    ["RNCP35136"],
    ["RNCP35418"],
    ["RNCP35434"],
    ["RNCP432"],
    ["RNCP813"],
  ])("should keep RNCP writting errors", async (inputValue) => {
    for (const _source of Object.values(kitApprentissageSourceMap)) {
      const record = {
        FicheRNCP: inputValue,
        "Code Diplôme": "00000000",
        "Intitulé diplôme (DEPP)": "",
        "Niveau fiche RNCP": "",
        "Abrégé de diplôme (RNCP)": "",
      };
      const getResult = () => buildKitApprentissageEntry(record);
      expect.soft(getResult()).toEqual({ cfd: "00000000", rncp: inputValue });
    }
  });

  it('should fix missing leading zeros in "Code Diplôme" field', async () => {
    const record = {
      FicheRNCP: "RNCP12803",
      "Code Diplôme": "1025409",
      "Intitulé diplôme (DEPP)": "",
      "Niveau fiche RNCP": "",
      "Abrégé de diplôme (RNCP)": "",
    };
    const result = buildKitApprentissageEntry(record);
    expect(result).toEqual({ cfd: "01025409", rncp: "RNCP12803" });
  });

  it('should fix SQWQ speeling errors in "Code Diplôme" field', async () => {
    for (const _source of Object.values(kitApprentissageSourceMap)) {
      const record = {
        FicheRNCP: "RNCP00000",
        "Code Diplôme": "SQWQ",
        "Intitulé diplôme (DEPP)": "",
        "Niveau fiche RNCP": "",
        "Abrégé de diplôme (RNCP)": "",
      };
      const getResult = () => buildKitApprentissageEntry(record);

      expect(getResult()).toEqual({ cfd: null, rncp: "RNCP00000" });
    }
    const record = {
      FicheRNCP: "RNCP12803",
      "Code Diplôme": "1025409",
      "Intitulé diplôme (DEPP)": "",
      "Niveau fiche RNCP": "",
      "Abrégé de diplôme (RNCP)": "",
    };
    const result = buildKitApprentissageEntry(record);

    expect(result).toEqual({ cfd: "01025409", rncp: "RNCP12803" });
  });
});
