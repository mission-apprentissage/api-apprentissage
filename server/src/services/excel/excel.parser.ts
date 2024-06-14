import { internal } from "@hapi/boom";
import ExcelJs from "exceljs";
import { assertUnreachable } from "shared";
import { Stream } from "stream";

declare module "exceljs" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace stream {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace xlsx {
      interface WorksheetReader {
        name: string;
      }
    }
  }
}

type ColumnSpec = Readonly<{
  name: string;
  regex: RegExp;
}>;

type Value = null | number | string | boolean | Date | undefined;

export type ExcelParseSheetSpec = Readonly<{
  key: string;
  skipRows: number;
  columns: ReadonlyArray<ColumnSpec | null>;
}>;

export type ExcelParseSpec = Readonly<Record<string, ExcelParseSheetSpec | null>>;

export type ExcelParsedRow = {
  sheet: string;
  data: Record<string, Value>;
};

function getCells(row: ExcelJs.Row): Array<ExcelJs.Cell> {
  const data: Array<ExcelJs.Cell> = [];
  row.eachCell({ includeEmpty: true }, (cell) => {
    data.push(cell);
  });
  return data;
}

function parseCell(cell: ExcelJs.Cell): Value {
  switch (cell.type) {
    case ExcelJs.ValueType.Null:
    case ExcelJs.ValueType.Merge:
    case ExcelJs.ValueType.Error:
      return null;
    case ExcelJs.ValueType.Number:
      return cell.value as number;
    case ExcelJs.ValueType.String:
    case ExcelJs.ValueType.Hyperlink:
    case ExcelJs.ValueType.RichText:
    case ExcelJs.ValueType.SharedString:
      return cell.text;
    case ExcelJs.ValueType.Boolean:
      return cell.value as boolean;
    case ExcelJs.ValueType.Date:
      return cell.value as Date;
    case ExcelJs.ValueType.Formula:
      return cell.result;
    default:
      assertUnreachable(cell.type);
  }
}

function parseRow(row: ExcelJs.Row, spec: ExcelParseSheetSpec): ExcelParsedRow {
  return spec.columns.reduce<ExcelParsedRow>(
    (acc, column, i) => {
      if (column === null) return acc;

      acc.data[column.name] = parseCell(row.getCell(i + 1)) ?? null;
      return acc;
    },
    { data: {}, sheet: spec.key }
  );
}

function isValidHeader(values: Value[], columns: ReadonlyArray<ColumnSpec | null>) {
  return (
    values.length === columns.length &&
    columns.every((column, i) => {
      const v = values[i];

      if (column === null) return v === null;

      return typeof v === "string" && column.regex.test(v);
    })
  );
}

async function* parseSheet(
  sheetSpec: ExcelParseSheetSpec,
  worksheetReader: ExcelJs.stream.xlsx.WorksheetReader
): AsyncGenerator<ExcelParsedRow, void, void> {
  let hasData = false;
  let hasHeader = false;
  const skippedRows = [];

  for await (const row of worksheetReader) {
    if (row.number <= sheetSpec.skipRows) {
      skippedRows.push(getCells(row).map(parseCell));
      continue;
    }

    if (!hasHeader) {
      const values = getCells(row).map(parseCell);

      if (!isValidHeader(values, sheetSpec.columns)) {
        throw internal("Header not found", { sheetSpec, sheet: worksheetReader.name, values, skippedRows });
      }

      hasHeader = true;
      continue;
    }

    if (row.hasValues) {
      hasData = true;
      yield parseRow(row, sheetSpec);
    }
  }

  if (!hasData || !hasHeader) {
    throw internal("No data found", { sheetSpec, sheet: worksheetReader.name, hasHeader, hasData });
  }
}

async function* parseWorkbook(
  parseSpec: ExcelParseSpec,
  workbookReader: ExcelJs.stream.xlsx.WorkbookReader
): AsyncGenerator<ExcelParsedRow, void, void> {
  const expectedWorksheets = new Set(Object.keys(parseSpec));

  for await (const worksheetReader of workbookReader) {
    if (!expectedWorksheets.has(worksheetReader.name)) {
      throw internal("Unexpected worksheet", { name: worksheetReader.name });
    }

    expectedWorksheets.delete(worksheetReader.name);
    const spec = parseSpec[worksheetReader.name];

    if (spec === null) {
      continue;
    }

    for await (const row of parseSheet(spec, worksheetReader)) {
      yield row;
    }
  }

  if (expectedWorksheets.size > 0) {
    throw internal("Missing worksheets", { missing: Array.from(expectedWorksheets.values()) });
  }
}

export function parseExcelFileStream(
  readStream: Stream,
  parseSpec: ExcelParseSpec
): AsyncGenerator<ExcelParsedRow, void, void> {
  const workbookReader = new ExcelJs.stream.xlsx.WorkbookReader(readStream, {
    worksheets: "emit",
    sharedStrings: "cache",
    hyperlinks: "ignore",
    styles: "cache",
    entries: "emit",
  });
  return parseWorkbook(parseSpec, workbookReader);
}
