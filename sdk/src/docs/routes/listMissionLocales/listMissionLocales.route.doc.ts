import { recuperationMissionLocalePageSummaryDoc } from "../../metier/recuperation-mission-locales/recuperation-mission-locales.doc.js";
import type { DocRoute } from "../../types.js";

export const listMissionLocalesRouteDoc = {
  summary: recuperationMissionLocalePageSummaryDoc.title,
  description: {
    fr: "Récupération de la liste des missions locales",
    en: "Retrieve the list of mission locales",
  },
  response: {
    description: {
      en: "Success",
      fr: "Succès",
    },
    content: {
      descriptions: [
        {
          fr: "Liste des missions locales",
          en: "List of mission locales",
        },
      ],
      items: {
        descriptions: null,
      },
    },
  },
} as const satisfies DocRoute;
