import { DateTime } from "luxon";

import { zodOpenApi } from "../openapi/utils/zodWithOpenApi.js";

export class ParisDate extends Date {
  static fromDate(date: Date): ParisDate {
    return new ParisDate(date.getTime());
  }
  toJSON(): string {
    return DateTime.fromJSDate(this, { zone: "Europe/Paris" }).toISO()!;
  }
}

export const zParisLocalDate = zodOpenApi
  .union([zodOpenApi.string().datetime({ offset: true }), zodOpenApi.string().date(), zodOpenApi.date()])
  .transform<ParisDate>((val) => {
    if (val instanceof Date) return ParisDate.fromDate(val);
    return ParisDate.fromDate(DateTime.fromISO(val, { zone: "Europe/Paris" }).toJSDate());
  })
  .openapi({ type: "string", format: "date-time" });

export const zParisLocalDateNullable = zParisLocalDate
  .nullable()
  .openapi({ type: ["string", "null"], format: "date-time" });
