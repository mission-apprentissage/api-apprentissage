import { Options, parse } from "csv-parse";
import { isEmpty, pickBy } from "lodash-es";

export const DEFAULT_DELIMITER = ";";

export function parseCsv(options: Options = {}) {
  return parse({
    trim: true,
    delimiter: DEFAULT_DELIMITER,
    columns: true,
    bom: true,
    relax_column_count: true,
    on_record: (record) => {
      return pickBy(record, (v) => {
        return !isEmpty(v) && v.trim().length;
      });
    },
    ...options,
  });
}
