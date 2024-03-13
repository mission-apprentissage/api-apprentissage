import { zodOpenApi } from "./zodWithOpenApi";

const parisIntlTimeFormat = new Intl.DateTimeFormat("fr-FR", {
  hourCycle: "h23",
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

interface IDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function parisTimezoneDate(parts: IDateParts): Date {
  const year = parts.year.toString().padStart(4, "0");
  const month = parts.month.toString().padStart(2, "0");
  const day = parts.day.toString().padStart(2, "0");
  const hour = parts.hour.toString().padStart(2, "0");
  const minute = parts.minute.toString().padStart(2, "0");
  const second = parts.second.toString().padStart(2, "0");

  // Determine timezone offset for the given date
  const winterDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}.000+01:00`);
  const summerDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}.000+02:00`);

  if (parisIntlTimeFormat.format(winterDate) === `${day}/${month}/${year} ${hour}:${minute}:${second}`) {
    return winterDate;
  }

  return summerDate;
}

export function parseParisLocalDate(date: string, time: string = "00:00:00", dayOffset: number = 0) {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  if (!dateMatch) {
    throw new Error(`Invalid date format: ${date}`);
  }

  const timeMatch = /^(\d{2}):(\d{2}):(\d{2})$/.exec(time);
  if (!timeMatch) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const [, day, month, year] = dateMatch;
  const [, hour, minute, second] = timeMatch;

  const result = parisTimezoneDate({
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  });
  if (dayOffset !== 0) {
    result.setDate(result.getDate() + dayOffset);
  }
  return result;
}

export function parseNullableParisLocalDate(
  date: string | null | undefined,
  time: string | null | undefined,
  dateOffset: number = 0
) {
  if (date == null) {
    return null;
  }

  return parseParisLocalDate(date, time ?? "00:00:00", dateOffset);
}

export const zDateParisLocalDate = zodOpenApi
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/)
  .transform((val) => {
    return parseParisLocalDate(val);
  });
