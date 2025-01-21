import { recuperationOrganismesPageSummaryDoc } from "../../metier/recuperation-organismes/recuperation-organismes.doc.js";
import type { DocRoute } from "../../types.js";

export const exportOrganismesRouteDoc = {
  summary: recuperationOrganismesPageSummaryDoc.title,
  description: recuperationOrganismesPageSummaryDoc.headline,
  response: {
    description: { en: "Success", fr: "Succès" },
    content: {
      descriptions: [{ en: "List of organizations", fr: "Liste des organismes" }],
      items: {
        descriptions: null,
      },
    },
  },
} as const satisfies DocRoute;
