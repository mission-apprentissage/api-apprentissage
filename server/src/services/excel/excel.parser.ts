import { internal } from "@hapi/boom";
import ExcelJs from "exceljs";
import { assertUnreachable } from "shared";
import type { Stream } from "stream";

import { withCause } from "@/services/errors/withCause.js";

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

type ColumnSpecIgnore = Readonly<{
  regex: ReadonlyArray<RegExp>;
  type: "ignore";
}>;

type ColumnSpecRequiredOrOptional = Readonly<{
  name: string;
  regex: ReadonlyArray<RegExp>;
  type: "required" | "optional";
}>;

type ColumnSpec = ColumnSpecIgnore | ColumnSpecRequiredOrOptional;

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
  columns: ReadonlyArray<ColumnSpec> | "auto";
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

function isColumnSpecMatch(spec: ColumnSpec, value: Value): boolean {
  if (typeof value === "string") return spec.regex.some((regex) => regex.test(value));

  return value === null && spec.regex.some((regex) => regex.test(""));
}

function findColumnSpec(columns: Set<ColumnSpec>, value: Value): ColumnSpec | null {
  for (const column of columns) {
    if (isColumnSpecMatch(column, value)) {
      if (column.type !== "ignore") {
        columns.delete(column);
      }

      return column;
    }
  }

  return null;
}

function getHeaders(
  values: Value[],
  columns: ReadonlyArray<ColumnSpec> | "auto",
  throwInvalid: (d: { extra: string[]; missing: string[] }) => never
): Array<string | null> {
  if (columns === "auto") {
    return values.map((value, i) => {
      if (value == null) return `__excel_parsed_column_${i}`;
      return String(value);
    });
  }

  const headers: Array<string | null> = [];
  const unprocessedSpecs: Set<ColumnSpec> = new Set(columns);

  const extraColumns: Value[] = [];

  for (const value of values) {
    const column = findColumnSpec(unprocessedSpecs, value);
    if (column === null) {
      extraColumns.push(value);
    } else if (column.type === "ignore") {
      headers.push(null);
    } else {
      headers.push(column.name);
    }
  }

  const missingColumns = Array.from(unprocessedSpecs)
    .filter((c) => c.type === "required")
    .map((c) => (c as ColumnSpecRequiredOrOptional).name);

  const validSpec = missingColumns.length === 0 && extraColumns.length === 0;

  if (!validSpec) {
    throwInvalid({ extra: extraColumns.map(String), missing: missingColumns });
  }

  return headers;
}

async function* parseSheet(
  sheetSpec: ExcelParseSheetSpecRequiredOrOptional,
  worksheetReader: ExcelJs.stream.xlsx.WorksheetReader
): AsyncGenerator<ExcelParsedRow, void, void> {
  let hasData = false;
  let headers: null | Array<string | null> = null;

  const skippedRows: Value[][] = [];

  try {
    for await (const row of worksheetReader) {
      if (row.number <= sheetSpec.skipRows) {
        skippedRows.push(getCells(row).map(parseCell));
        continue;
      }

      if (headers === null) {
        const values = getCells(row).map(parseCell);

        headers = getHeaders(
          getCells(row).map(parseCell),
          sheetSpec.columns,
          ({ extra, missing }: { extra: string[]; missing: string[] }) => {
            throw internal("Invalid header found", {
              extra,
              missing,
              sheetSpec,
              sheet: worksheetReader.name,
              values,
              skippedRows,
            });
          }
        );
        continue;
      }

      if (headers !== null && row.hasValues) {
        hasData = true;
        yield parseRow(row, sheetSpec.key, headers);
      }
    }
  } catch (error) {
    throw withCause(internal("excel.parser: unable to parseSheet", { sheetSpec, worksheetReader }), error);
  }

  if (!hasData || headers === null) {
    throw internal("No data found", { sheetSpec, sheet: worksheetReader.name, headers, hasData });
  }
}

function getParseSheetSpec(
  unprocessedSpecs: Set<ExcelParseSheetSpec>,
  worksheetReader: ExcelJs.stream.xlsx.WorksheetReader
): ExcelParseSheetSpec | null {
  for (const sheetSpec of unprocessedSpecs) {
    if (sheetSpec.nameMatchers.some((matcher) => matcher.test(worksheetReader.name))) {
      if (sheetSpec.type !== "ignore") {
        unprocessedSpecs.delete(sheetSpec);
      }
      return sheetSpec;
    }
  }

  return null;
}

async function* parseWorkbook(
  parseSpec: ExcelParseSpec,
  workbookReader: ExcelJs.stream.xlsx.WorkbookReader
): AsyncGenerator<ExcelParsedRow, void, void> {
  const unusedSpecs = new Set(parseSpec);
  const unexpectedWorksheets: string[] = [];

  try {
    for await (const worksheetReader of workbookReader) {
      const spec = getParseSheetSpec(unusedSpecs, worksheetReader);

      if (spec === null) {
        unexpectedWorksheets.push(worksheetReader.name);
        continue;
      }

      if (spec.type === "ignore") {
        continue;
      }

      for await (const row of parseSheet(spec, worksheetReader)) {
        yield row;
      }
    }

    const missingSpecs = Array.from(unusedSpecs).filter((s) => s.type === "required");
    if (missingSpecs.length > 0 || unexpectedWorksheets.length > 0) {
      throw internal("Unexpected worksheets", { missingSpecs, unexpectedWorksheets });
    }
  } catch (error) {
    throw withCause(internal("excel.parser: unable to parseWorkbook", { parseSpec, workbookReader }), error);
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
