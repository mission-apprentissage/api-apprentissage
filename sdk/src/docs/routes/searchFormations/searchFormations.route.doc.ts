import { rechercheFormationPageSummaryDoc } from "../../metier/recherche-formation/recherche-formation.doc.js";
import type { DocRoute } from "../../types.js";
import { jobSearchRouteDoc } from "../jobSearch/jobSearch.route.doc.js";

export const searchFormationsRouteDoc = {
  summary: rechercheFormationPageSummaryDoc.title,
  description: rechercheFormationPageSummaryDoc.headline,
  parameters: {
    longitude: jobSearchRouteDoc.parameters.longitude,
    latitude: jobSearchRouteDoc.parameters.latitude,
    radius: jobSearchRouteDoc.parameters.radius,
    rncp: jobSearchRouteDoc.parameters.rncp,
    romes: jobSearchRouteDoc.parameters.romes,
    target_diploma_level: jobSearchRouteDoc.parameters.target_diploma_level,
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
  },
  response: {
    description: {
      en: "Success",
      fr: "Succès",
    },
    content: {
      descriptions: null,
      properties: {
        data: {
          descriptions: [
            {
              en: "List of training courses matching the search criteria",
              fr: "Liste des formations correspondant aux critères de recherche",
            },
          ],
          items: {
            descriptions: null,
          },
        },
        pagination: {
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
        },
      },
    },
  },
} as const satisfies DocRoute;
