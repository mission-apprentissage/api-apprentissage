import type { DocRoute } from "../../types.js";

export const communeSearchRouteDoc = {
  summary: {
    en: "Search for communes by INSEE or postal code",
    fr: "Recherche de communes par code insee ou postal",
  },
  description: {
    fr: "Recherche de communes par code insee ou postal. Attention, un meme code postal peut-etre associé à plusieurs communes et une commune peut avoir plusieurs code postaux.",
    en: "Search for communes by INSEE or postal code. Be aware that a same postal code can be associated with multiple communes and a commune can have multiple postal codes.",
  },
  parameters: {
    code: {
      description: { en: null, fr: "Code INSEE ou postal recherché" },
      examples: ["75056", "75000"],
    },
  },
  response: {
    description: {
      en: "Success",
      fr: "Succès",
    },
    content: {
      description: {
        fr: "Liste des communes correspondant au code INSEE ou postal recherché",
        en: "List of communes matching the INSEE or postal code searched",
      },
    },
  },
} as const satisfies DocRoute;
