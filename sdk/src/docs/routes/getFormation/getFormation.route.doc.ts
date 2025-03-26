import { recuperationFormationPageSummaryDoc } from "../../metier/recuperation-formation/recuperation-formation.doc.js";
import { paginationQueryParameterDoc } from "../../models/pagination/pagination.model.doc.js";
import type { DocRoute } from "../../types.js";
import { jobSearchRouteDoc } from "../jobSearch/jobSearch.route.doc.js";

export const getFormationRouteDoc = {
  summary: recuperationFormationPageSummaryDoc.title,
  description: recuperationFormationPageSummaryDoc.headline,
  parameters: {
    longitude: jobSearchRouteDoc.parameters.longitude,
    latitude: jobSearchRouteDoc.parameters.latitude,
    radius: jobSearchRouteDoc.parameters.radius,
    rncp: jobSearchRouteDoc.parameters.rncp,
    romes: jobSearchRouteDoc.parameters.romes,
    target_diploma_level: jobSearchRouteDoc.parameters.target_diploma_level,
    ...paginationQueryParameterDoc,
    include_archived: {
      descriptions: [
        {
          fr: "Inclure les formations archivées dans les résultats",
          en: "Include archived training courses in the results",
        },
      ],
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
          descriptions: null,
        },
      },
    },
  },
} as const satisfies DocRoute;
