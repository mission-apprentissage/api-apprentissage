import { DateTime } from "luxon";

import { zodOpenApi } from "./zodWithOpenApi";

interface IDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export class LocalDate extends Date {
  static fromDate(date: Date): LocalDate {
    return new LocalDate(date.getTime());
  }
  toJSON(): string {
    return DateTime.fromJSDate(this, { zone: "Europe/Paris" }).toISO()!;
  }
}

export function parisTimezoneDate(parts: IDateParts): LocalDate {
  return LocalDate.fromDate(DateTime.fromObject(parts, { zone: "Europe/Paris" }).toJSDate());
}

export function parseParisLocalDate(date: string, time: string = "00:00:00", dayOffset: number = 0): LocalDate {
  const dt = DateTime.fromFormat(`${date} ${time}`, "dd/MM/yyyy HH:mm:ss", { zone: "Europe/Paris" });
  return LocalDate.fromDate(dt.plus({ days: dayOffset }).toJSDate());
}

export function parseNullableParisLocalDate(
  date: string | null | undefined,
  time: string | null | undefined,
  dateOffset: number = 0
): LocalDate | null {
  if (date == null) {
    return null;
  }

  return parseParisLocalDate(date, time ?? "00:00:00", dateOffset);
}

export const zParisLocalDateString = zodOpenApi
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/)
  .transform((val) => {
    return parseParisLocalDate(val);
  });

export const zLocalDate = zodOpenApi.date().transform((val) => {
  return LocalDate.fromDate(val);
});
