import { recuperationFormationPageSummaryDoc } from "../../internal.js";
import type { DocRoute } from "../../types.js";

export const searchFormationByIdRouteDoc = {
  summary: recuperationFormationPageSummaryDoc.title,
  description: recuperationFormationPageSummaryDoc.headline,
  parameters: {
    id: {
      descriptions: [{ en: null, fr: "Identifiant unique de la formation - clé ME" }],
      examples: ["049510P01118838776490001178615112600012-49099#L01"],
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
              en: "Training course matching the identifier",
              fr: "Formations correspondant à l'identifiant de recherche (clé ME)",
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
