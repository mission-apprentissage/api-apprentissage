import type { DocTechnicalField } from "../../types.js";

export const paginationModelDoc = {
  descriptions: [{ en: "Pagination information", fr: "Informations de pagination" }],
  properties: {
    page_index: {
      descriptions: [{ en: "Current page number", fr: "Numéro de la page actuelle" }],
    },
    page_size: {
      descriptions: [{ en: "Number of items per page", fr: "Nombre d'éléments par page" }],
    },
    page_count: {
      descriptions: [{ en: "Total number of pages", fr: "Nombre total de pages" }],
    },
  },
} as const satisfies DocTechnicalField;

export const paginationQueryParameterDoc = {
  page_size: {
    descriptions: [
      {
        fr: "Nombre d'éléments par page",
        en: "Number of items per page",
      },
    ],
    examples: [10],
  },
  page_index: {
    descriptions: [
      {
        fr: "Numéro de la page actuelle (commence à 0)",
        en: "Current page number (starts at 0)",
      },
    ],
    examples: [12],
  },
};
