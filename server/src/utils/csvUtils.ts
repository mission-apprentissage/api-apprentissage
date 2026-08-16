import type { CastingContext } from "csv-parse"

/**
 * Quand l'option `columns` de csv-parse est activée, le contexte passé à `onRecord`
 * contient la description des colonnes — mais `CastingContext` ne la déclare pas.
 * Ce type comble ce trou des typings amont, à la place du `any` qui l'occupait.
 */
export type CsvRecordContext = CastingContext & {
  columns: { name: string }[]
}
