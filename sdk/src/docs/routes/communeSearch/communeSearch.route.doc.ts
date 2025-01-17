import { rechercheCommunePageSummaryDoc } from "../../metier/recherche-commune/recherche-commune.doc.js";
import type { DocRoute } from "../../types.js";

export const communeSearchRouteDoc = {
  summary: rechercheCommunePageSummaryDoc.title,
  description: {
    fr: "Recherche de communes par code insee ou postal. La recherche par code INSEE, recherche également parmis les anciennes communes fusionnées (déléguées ou associées) et parmis les arrondissements municipaux. Attention, un meme code postal peut-etre associé à plusieurs communes et une commune peut avoir plusieurs code postaux.",
    en: "Search for municipalities by INSEE or postal code. Searching by INSEE code also includes merged municipalities (delegated or associated) and municipal districts. Please note that a single postal code may be associated with multiple municipalities, and a municipality may have multiple postal codes.",
  },
  parameters: {
    code: {
      descriptions: [{ en: null, fr: "Code INSEE ou postal recherché" }],
      examples: ["75056", "75000"],
    },
  },
  response: {
    description: {
      en: "Success",
      fr: "Succès",
    },
    content: {
      descriptions: [
        {
          fr: "Liste des communes correspondant au code INSEE ou postal recherché",
          en: "List of communes matching the INSEE or postal code searched",
        },
      ],
      items: {
        descriptions: null,
      },
    },
  },
} as const satisfies DocRoute;
