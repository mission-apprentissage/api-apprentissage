import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const prettyPrintDate = (date: string) => {
  const event = new Date(date);
  const options = {
    hour: "2-digit" as const,
    minute: "2-digit" as const,
    year: "numeric" as const,
    month: "short" as const,
    day: "numeric" as const,
  };

  return event.toLocaleDateString("fr-FR", options);
};

export const formatDate = (date: string | Date, dateFormat = "dd/MM/yyyy") => {
  return format(date, dateFormat, {
    locale: fr,
  });
};

export const formatNullableDate = (date: string | null | Date, dateFormat = "dd/MM/yyyy", nullLabel = "Jamais") => {
  return date ? formatDate(date, dateFormat) : nullLabel;
};
