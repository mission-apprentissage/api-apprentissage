import { createReadStream } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { parseExcelFileStream } from './excel.parser.js';

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

    const spec = {
      "Onglet 3 - référentiel NPEC": {
        key: "npec",
        skipRows: 3,
        columns: [
          { name: "rncp", regex: /^Code RNCP$/i },
          { name: "formation_libelle", regex: /^Libellé de la formation$/i },
          { name: "certificateur", regex: /^Certificateur\*\s+/i },
          { name: "diplome_libelle", regex: /^Libellé du Diplôme$/i },
          { name: "cpne_code", regex: /^Code CPNE$/i },
          { name: "cpne_libelle", regex: /^CPNE$/i },
          { name: "npec", regex: /^NPEC final$/i },
        ],
      },
      "Onglet 4 - CPNE-IDCC": {
        key: "cpne-idcc",
        skipRows: 1,
        columns: [
          { name: "cpne_code", regex: /^Code CPNE/i },
          { name: "cpne_libelle", regex: /^CPNE/i },
          { name: "idcc", regex: /^IDCC/i },
        ],
      },
    };

    const data = await getRows(parseExcelFileStream(s, spec));

    expect(data).toMatchSnapshot();
  });

  it("should skip parsing if spec is null", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/file.xlsx");
    const s = createReadStream(dataFixture);

    const spec = {
      "Onglet 3 - référentiel NPEC": null,
      "Onglet 4 - CPNE-IDCC": {
        key: "cpne-idcc",
        skipRows: 1,
        columns: [
          { name: "cpne_code", regex: /^Code CPNE/i },
          { name: "cpne_libelle", regex: /^CPNE/i },
          { name: "idcc", regex: /^IDCC/i },
        ],
      },
    };

    const data = await getRows(parseExcelFileStream(s, spec));

    expect(data).toMatchSnapshot();
  });

  it("should throw if sheet is not found", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/file.xlsx");
    const s = createReadStream(dataFixture);

    const spec = {
      "Onglet 3 - référentiel NPEC": null,
      "Onglet 4 - CPNE-IDCC": {
        key: "cpne-idcc",
        skipRows: 1,
        columns: [
          { name: "cpne_code", regex: /^Code CPNE/i },
          { name: "cpne_libelle", regex: /^CPNE/i },
          { name: "idcc", regex: /^IDCC/i },
        ],
      },
      missing: {
        key: "missing",
        skipRows: 1,
        columns: [],
      },
    };

    await expect(getRows(parseExcelFileStream(s, spec))).rejects.toThrow("Missing worksheets");
  });

  it("should throw if extra sheet is found", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/file.xlsx");
    const s = createReadStream(dataFixture);

    const spec = {
      "Onglet 3 - référentiel NPEC": null,
    };

    await expect(getRows(parseExcelFileStream(s, spec))).rejects.toThrow("Unexpected worksheet");
  });
});
