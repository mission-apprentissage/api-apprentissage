import type { DocRoute } from "../../types.js";

export const listMissionLocalesRouteDoc = {
  summary: {
    en: "Retrieve the list of mission locales",
    fr: "Récupération de la liste des missions locales",
  },
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
      description: {
        fr: "Liste des missions locales",
        en: "List of mission locales",
      },
    },
  },
} as const satisfies DocRoute;
