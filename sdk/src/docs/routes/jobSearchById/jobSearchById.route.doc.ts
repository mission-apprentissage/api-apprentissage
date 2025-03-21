import { recuperationDetailOffrePageSummaryDoc } from "../../internal.js";
import type { DocRoute } from "../../types.js";

export const jobSearchByIdRouteDoc = {
  summary: recuperationDetailOffrePageSummaryDoc.title,
  description: {
    en: "Access the details of a work-study job offer from its identifier.",
    fr: "Accéder au détail d'une opportunité d'emploi en alternance à partir de son identifiant.",
  },
  parameters: {
    id: {
      descriptions: [{ en: null, fr: "Identifiant unique de l’opportunité d’emploi" }],
      examples: ["6687165396d52b5e01b409545"],
    },
  },
  response: {
    description: { en: "Success", fr: "Succès" },
    content: {
      descriptions: [
        {
          en: "Job offer corresponding to the search.",
          fr: "Détail de l'offre correspondant à l'identifiant fourni",
        },
      ],
    },
  },
} as const satisfies DocRoute;
