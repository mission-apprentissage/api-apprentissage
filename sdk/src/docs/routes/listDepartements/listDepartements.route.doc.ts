import type { DocRoute } from "../../types.js";

export const listDepartementsRouteDoc = {
  summary: {
    en: "Retrieve French departments",
    fr: "Récupération des départements français",
  },
  description: {
    fr: "Récupération des départements français, pour des raisons pratiques les collectivités et territoires d'outre-mer sont inclus et assimilés à des départements",
    en: "Retrieve French departments, for practical reasons the overseas collectivities and territories are included and assimilated to departments",
  },
  response: {
    description: {
      en: "Success",
      fr: "Succès",
    },
    content: {
      descriptions: [
        {
          fr: "Liste des départements français",
          en: "List of French departments",
        },
      ],
      _: {
        "[]": {
          descriptions: null,
        },
      },
    },
  },
} as const satisfies DocRoute;
