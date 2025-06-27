import { DateTime } from "luxon";
import { z } from "zod/v4-mini";

export class ParisDate extends Date {
  static fromDate(date: Date): ParisDate {
    return new ParisDate(date.getTime());
  }
  toJSON(): string {
    return DateTime.fromJSDate(this, { zone: "Europe/Paris" }).toISO()!;
  }
}

export const zParisLocalDate = z.pipe(
  z.union([z.iso.datetime({ offset: true }), z.iso.date(), z.date()]),
  z.transform<ParisDate>((val) => {
    if (val instanceof Date) return ParisDate.fromDate(val);
    return ParisDate.fromDate(DateTime.fromISO(val, { zone: "Europe/Paris" }).toJSDate());
  })
);

export const zParisLocalDateNullable = z.nullable(zParisLocalDate);
