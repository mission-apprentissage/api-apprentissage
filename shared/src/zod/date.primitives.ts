import { zodOpenApi } from "api-alternance-sdk/internal";
import { DateTime } from "luxon";

interface IDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export class ParisDate extends Date {
  static fromDate(date: Date): ParisDate {
    return new ParisDate(date.getTime());
  }
  toJSON(): string {
    return DateTime.fromJSDate(this, { zone: "Europe/Paris" }).toISO()!;
  }
}

export function parisTimezoneDate(parts: IDateParts): ParisDate {
  return ParisDate.fromDate(DateTime.fromObject(parts, { zone: "Europe/Paris" }).toJSDate());
}

export function parseParisLocalDate(date: string, time: string = "00:00:00", dayOffset: number = 0): ParisDate {
  const dt = DateTime.fromFormat(`${date} ${time}`, "dd/MM/yyyy HH:mm:ss", { zone: "Europe/Paris" });
  return ParisDate.fromDate(dt.plus({ days: dayOffset }).toJSDate());
}

export function parseNullableParisLocalDate(
  date: string | null | undefined,
  time: string | null | undefined,
  dateOffset: number = 0
): ParisDate | null {
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

export const zLocalDate = zodOpenApi
  .date()
  .transform((val) => {
    return ParisDate.fromDate(val);
  })
  .openapi({
    format: "date-time",
  });

export const zParisLocalDate = zodOpenApi
  .union([zodOpenApi.string().datetime({ offset: true }), zodOpenApi.string().date()])
  .transform((val) => {
    return ParisDate.fromDate(DateTime.fromISO(val, { zone: "Europe/Paris" }).toJSDate());
  })
  .openapi({
    format: "date-time",
  });
