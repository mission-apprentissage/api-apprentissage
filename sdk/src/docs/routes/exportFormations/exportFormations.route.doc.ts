import type { DocRoute } from "../../types.js";

export const exportFormationsRouteDoc = {
  summary: {
    fr: "Récupération de l'ensemble des formations",
    en: "Retrieve all training courses",
  },
  description: {
    fr: "Récupère non seulement les formations publiées mais aussi celles archivées et supprimées",
    en: "Retrieves not only published training courses but also archived and deleted ones",
  },
  response: {
    description: {
      en: "Success",
      fr: "Succès",
    },
    content: {
      descriptions: null,
      items: {
        descriptions: null,
      },
    },
  },
} as const satisfies DocRoute;
