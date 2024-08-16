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

type ExcelParseSheetSpecIgnore = Readonly<{
  type: "ignore";
  nameMatchers: ReadonlyArray<RegExp>;
}>;

type ExcelParseSheetSpecRequiredOrOptional = Readonly<{
  type: "required" | "optional";
  key: string;
  nameMatchers: ReadonlyArray<RegExp>;
  skipRows: number;
  columns: ReadonlyArray<ColumnSpec | null> | "auto";
}>;

export type ExcelParseSheetSpec = ExcelParseSheetSpecIgnore | ExcelParseSheetSpecRequiredOrOptional;

export type ExcelParseSpec = ReadonlyArray<ExcelParseSheetSpec>;

export type ExcelParsedRow = {
  sheet: string;
  headers: Array<string | null>;
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

function parseRow(row: ExcelJs.Row, sheet: string, headers: Array<string | null>): ExcelParsedRow {
  return headers.reduce<ExcelParsedRow>(
    (acc, header, i) => {
      if (header === null) return acc;

      acc.data[header] = parseCell(row.getCell(i + 1)) ?? null;
      return acc;
    },
    { data: {}, sheet, headers }
  );
}

function getHeaders(
  values: Value[],
  columns: ReadonlyArray<ColumnSpec | null> | "auto",
  throwInvalid: () => never
): Array<string | null> {
  if (columns === "auto") {
    return values.map((value, i) => {
      if (value == null) return `__excel_parsed_column_${i}`;
      return String(value);
    });
  }

  const extraValues = values.slice(columns.length);

  const everyColumnFound = columns.every((column, i) => {
    const v = values[i];

    if (column === null) return v === null;

    return typeof v === "string" && column.regex.test(v);
  });

  const validSpec = everyColumnFound && extraValues.every((v) => v === null);

  if (!validSpec) {
    throwInvalid();
  }

  return columns.map((column) => (column === null ? null : column.name));
}

async function* parseSheet(
  sheetSpec: ExcelParseSheetSpecRequiredOrOptional,
  worksheetReader: ExcelJs.stream.xlsx.WorksheetReader
): AsyncGenerator<ExcelParsedRow, void, void> {
  let hasData = false;
  let headers: null | Array<string | null> = null;

  const skippedRows: Value[][] = [];

  for await (const row of worksheetReader) {
    if (row.number <= sheetSpec.skipRows) {
      skippedRows.push(getCells(row).map(parseCell));
      continue;
    }

    if (headers === null) {
      const values = getCells(row).map(parseCell);

      headers = getHeaders(getCells(row).map(parseCell), sheetSpec.columns, () => {
        throw internal("Header not found", { sheetSpec, sheet: worksheetReader.name, values, skippedRows });
      });
      continue;
    }

    if (headers !== null && row.hasValues) {
      hasData = true;
      yield parseRow(row, sheetSpec.key, headers);
    }
  }

  if (!hasData || headers === null) {
    throw internal("No data found", { sheetSpec, sheet: worksheetReader.name, headers, hasData });
  }
}

function getParseSheetSpec(
  unprocessedSpecs: Set<ExcelParseSheetSpec>,
  worksheetReader: ExcelJs.stream.xlsx.WorksheetReader
): ExcelParseSheetSpec {
  for (const sheetSpec of unprocessedSpecs) {
    if (sheetSpec.nameMatchers.some((matcher) => matcher.test(worksheetReader.name))) {
      if (sheetSpec.type !== "ignore") {
        unprocessedSpecs.delete(sheetSpec);
      }
      return sheetSpec;
    }
  }

  throw internal("Unexpected worksheet", {
    name: worksheetReader.name,
    unprocessedSpecs: Array.from(unprocessedSpecs),
  });
}

async function* parseWorkbook(
  parseSpec: ExcelParseSpec,
  workbookReader: ExcelJs.stream.xlsx.WorkbookReader
): AsyncGenerator<ExcelParsedRow, void, void> {
  const unusedSpecs = new Set(parseSpec);

  for await (const worksheetReader of workbookReader) {
    const spec = getParseSheetSpec(unusedSpecs, worksheetReader);

    if (spec.type === "ignore") {
      continue;
    }

    for await (const row of parseSheet(spec, worksheetReader)) {
      yield row;
    }
  }

  const missingSpecs = Array.from(unusedSpecs).filter((s) => s.type === "required");
  if (missingSpecs.length > 0) {
    throw internal("Missing worksheets", { missingSpecs });
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
