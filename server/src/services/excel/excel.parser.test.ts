import { createReadStream } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { parseExcelFileStream } from "./excel.parser.js";

async function getRows<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const data: T[] = [];
  for await (const row of generator) {
    data.push(row);
  }

  return data;
}

describe("parseExcelFileStream", () => {
  it("should parse the excel file stream", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/file.xlsx");
    const s = createReadStream(dataFixture);

    const spec = [
      {
        type: "required",
        nameMatchers: [/Onglet 3 - référentiel NPEC/i],
        key: "npec",
        skipRows: 3,
        columns: [
          { type: "required", name: "rncp", regex: [/^Code RNCP$/i] },
          { type: "required", name: "formation_libelle", regex: [/^Libellé de la formation$/i] },
          { type: "required", name: "certificateur", regex: [/^Certificateur\*\s+/i] },
          { type: "required", name: "diplome_libelle", regex: [/^Libellé du Diplôme$/i] },
          { type: "required", name: "cpne_code", regex: [/^Code CPNE$/i] },
          { type: "required", name: "cpne_libelle", regex: [/^CPNE$/i] },
          { type: "required", name: "npec", regex: [/^NPEC final$/i] },
        ],
      },
      {
        type: "required",
        nameMatchers: [/Onglet 4 - CPNE-IDCC/i],
        key: "cpne-idcc",
        skipRows: 1,
        columns: [
          { type: "required", name: "cpne_code", regex: [/^Code CPNE/i] },
          { type: "required", name: "cpne_libelle", regex: [/^CPNE/i] },
          { type: "required", name: "idcc", regex: [/^IDCC/i] },
        ],
      },
    ] as const;

    const data = await getRows(parseExcelFileStream(s, spec));

    expect(data).toMatchSnapshot();
  });

  it("should skip parsing if spec is null", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/file.xlsx");
    const s = createReadStream(dataFixture);

    const spec = [
      {
        type: "ignore",
        nameMatchers: [/Onglet 3 - référentiel NPEC/i],
      },
      {
        type: "required",
        nameMatchers: [/Onglet 4 - CPNE-IDCC/i],
        key: "cpne-idcc",
        skipRows: 1,
        columns: [
          { type: "required", name: "cpne_code", regex: [/^Code CPNE/i] },
          { type: "required", name: "cpne_libelle", regex: [/^CPNE/i] },
          { type: "required", name: "idcc", regex: [/^IDCC/i] },
        ],
      },
    ] as const;

    const data = await getRows(parseExcelFileStream(s, spec));

    expect(data).toMatchSnapshot();
  });

  it("should throw if sheet is not found", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/file.xlsx");
    const s = createReadStream(dataFixture);

    const spec = [
      {
        type: "ignore",
        nameMatchers: [/Onglet 3 - référentiel NPEC/i],
      },
      {
        type: "required",
        nameMatchers: [/Onglet 4 - CPNE-IDCC/i],
        key: "cpne-idcc",
        skipRows: 1,
        columns: [
          { type: "required", name: "cpne_code", regex: [/^Code CPNE/i] },
          { type: "required", name: "cpne_libelle", regex: [/^CPNE/i] },
          { type: "required", name: "idcc", regex: [/^IDCC/i] },
        ],
      },
      {
        type: "required",
        key: "missing",
        nameMatchers: [/missing/i],
        skipRows: 1,
        columns: [],
      },
    ] as const;

    await expect(getRows(parseExcelFileStream(s, spec))).rejects.toThrow("Missing worksheets");
  });

  it("should not require optional sheets", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/file.xlsx");
    const s = createReadStream(dataFixture);

    const spec = [
      {
        type: "ignore",
        nameMatchers: [/Onglet 3 - référentiel NPEC/i],
      },
      {
        type: "required",
        nameMatchers: [/Onglet 4 - CPNE-IDCC/i],
        key: "cpne-idcc",
        skipRows: 1,
        columns: [
          { type: "required", name: "cpne_code", regex: [/^Code CPNE/i] },
          { type: "required", name: "cpne_libelle", regex: [/^CPNE/i] },
          { type: "required", name: "idcc", regex: [/^IDCC/i] },
        ],
      },
      {
        type: "optional",
        key: "missing",
        nameMatchers: [/missing/i],
        skipRows: 1,
        columns: [],
      },
    ] as const;

    await expect(getRows(parseExcelFileStream(s, spec))).resolves.toBeDefined();
  });

  it("should throw if extra sheet is found", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/file.xlsx");
    const s = createReadStream(dataFixture);

    const spec = [
      {
        type: "ignore",
        nameMatchers: [/Onglet 3 - référentiel NPEC/i],
      },
    ] as const;

    await expect(getRows(parseExcelFileStream(s, spec))).rejects.toThrow("Unexpected worksheet");
  });

  it("should be able to detect headers when column is set to auto", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/file.xlsx");
    const s = createReadStream(dataFixture);

    const spec = [
      {
        type: "required",
        nameMatchers: [/Onglet 3 - référentiel NPEC/i],
        key: "npec",
        skipRows: 3,
        columns: "auto",
      },
      {
        type: "ignore",
        nameMatchers: [/Onglet 4 - CPNE-IDCC/i],
      },
    ] as const;

    const data = await getRows(parseExcelFileStream(s, spec));

    expect(data).toMatchSnapshot();
  });
});
