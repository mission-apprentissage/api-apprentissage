import { describe, expect, it } from "vitest";

import { buildKitApprentissageEntry, getVersionNumber } from "./kit_apprentissage.builder";

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
    [
      "RNCP12803?",
      "RNCP12803",
      [
        kitApprentissageSourceMap.v1_0,
        kitApprentissageSourceMap.v1_1,
        kitApprentissageSourceMap.v1_2,
        kitApprentissageSourceMap.v1_3,
      ],
    ],
    [
      "RNCP187485",
      "NR",
      [
        kitApprentissageSourceMap.v1_0,
        kitApprentissageSourceMap.v1_1,
        kitApprentissageSourceMap.v1_2,
        kitApprentissageSourceMap.v1_3,
      ],
    ],
    [
      "RNCP24544",
      "NR",
      [
        kitApprentissageSourceMap.v1_0,
        kitApprentissageSourceMap.v1_1,
        kitApprentissageSourceMap.v1_2,
        kitApprentissageSourceMap.v1_3,
      ],
    ],
    [
      "RNCP28378",
      "RNCP29378",
      [
        kitApprentissageSourceMap.v1_0,
        kitApprentissageSourceMap.v1_1,
        kitApprentissageSourceMap.v1_2,
        kitApprentissageSourceMap.v1_3,
      ],
    ],
    [
      "RNCP29839",
      "RNCP26839",
      [
        kitApprentissageSourceMap.v1_0,
        kitApprentissageSourceMap.v1_1,
        kitApprentissageSourceMap.v1_2,
        kitApprentissageSourceMap.v1_3,
      ],
    ],
    ["RNCP30348", "NR", [kitApprentissageSourceMap.v1_2]],
    ["RNCP30387?", "RNCP30387", [kitApprentissageSourceMap.v1_0]],
    ["RNCP35136", "RNCP35135", [kitApprentissageSourceMap.v1_4]],
    ["RNCP35418", "RNCP35417", [kitApprentissageSourceMap.v1_6]],
    ["RNCP35434", "RNCP35433", [kitApprentissageSourceMap.v1_6]],
    ["RNCP432", "RNCP34432", [kitApprentissageSourceMap.v1_0]],
    [
      "RNCP813",
      "RNCP1813",
      [
        kitApprentissageSourceMap.v1_0,
        kitApprentissageSourceMap.v1_1,
        kitApprentissageSourceMap.v1_2,
        kitApprentissageSourceMap.v1_3,
      ],
    ],
  ])(
    "should fix RNCP writting errors from %s to %s for sources %s",
    async (inputValue, expectedValue, affectedSources) => {
      for (const source of Object.values(kitApprentissageSourceMap)) {
        const record = {
          FicheRNCP: inputValue,
          "Code Diplôme": "00000000",
          "Intitulé diplôme (DEPP)": "",
          "Niveau fiche RNCP": "",
          "Abrégé de diplôme (RNCP)": "",
        };
        const columns = Object.keys(record).map((k) => ({ name: k }));
        const version = getVersionNumber(source);
        const getResult = () =>
          buildKitApprentissageEntry(columns, record, source, new Date("2024-04-04T00:00:00.000Z"), version);
        if (affectedSources.includes(source)) {
          expect.soft(getResult().data["FicheRNCP"]).toBe(expectedValue);
        } else {
          expect.soft(getResult).toThrowError(`import.kit_apprentissage: unexpected version ${version}`);
        }
      }
    }
  );

  it('should fix missing leading zeros in "Code Diplôme" field', async () => {
    const record = {
      FicheRNCP: "RNCP12803",
      "Code Diplôme": "1025409",
      "Intitulé diplôme (DEPP)": "",
      "Niveau fiche RNCP": "",
      "Abrégé de diplôme (RNCP)": "",
    };
    const columns = Object.keys(record).map((k) => ({ name: k }));
    const result = buildKitApprentissageEntry(
      columns,
      record,
      "Kit_apprentissage_20240223.csv",
      new Date("2024-04-04T00:00:00.000Z"),
      "20240223"
    );
    expect(result.data["Code Diplôme"]).toBe("01025409");
  });

  it('should fix SQWQ speeling errors in "Code Diplôme" field', async () => {
    for (const source of Object.values(kitApprentissageSourceMap)) {
      const record = {
        FicheRNCP: "RNCP00000",
        "Code Diplôme": "SQWQ",
        "Intitulé diplôme (DEPP)": "",
        "Niveau fiche RNCP": "",
        "Abrégé de diplôme (RNCP)": "",
      };
      const columns = Object.keys(record).map((k) => ({ name: k }));
      const version = getVersionNumber(source);
      const getResult = () =>
        buildKitApprentissageEntry(columns, record, source, new Date("2024-04-04T00:00:00.000Z"), version);

      if (
        [kitApprentissageSourceMap.v2_3, kitApprentissageSourceMap.v2_4, kitApprentissageSourceMap.v2_5].includes(
          source
        )
      ) {
        expect.soft(getResult().data["Code Diplôme"]).toBe("NR");
      } else {
        expect.soft(getResult).toThrowError(`import.kit_apprentissage: SQWQ value in unexpected file ${source}`);
      }
    }
    const record = {
      FicheRNCP: "RNCP12803",
      "Code Diplôme": "1025409",
      "Intitulé diplôme (DEPP)": "",
      "Niveau fiche RNCP": "",
      "Abrégé de diplôme (RNCP)": "",
    };
    const columns = Object.keys(record).map((k) => ({ name: k }));
    const result = buildKitApprentissageEntry(
      columns,
      record,
      "Kit_apprentissage_20240223.csv",
      new Date("2024-04-04T00:00:00.000Z"),
      "20240223"
    );
    expect(result.data["Code Diplôme"]).toBe("01025409");
  });
});
