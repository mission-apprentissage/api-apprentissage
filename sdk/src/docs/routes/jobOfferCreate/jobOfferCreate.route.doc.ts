import { depotOffrePageSummaryDoc } from "../../metier/depot-offre/depot-offre.doc.js";
import type { DocRoute } from "../../types.js";

export const jobOfferCreateRouteDoc = {
  summary: depotOffrePageSummaryDoc.title,
  description: {
    en: "This API allows you to maximize the visibility of your apprenticeship job offers by sharing them with the La bonne alternance service, which then automatically redistributes them to the most relevant candidates on its site as well as its partner sites.",
    fr: "Cette API vous permet de maximiser la visibilité de vos offres d'emploi en alternance en les partageant avec le service La bonne alternance qui les redistribue automatiquement aux candidats les plus pertinents sur son site ainsi que sur ses sites partenaires.",
  },
  body: {
    description: null,
  },
  response: {
    description: { en: "Success", fr: "Succès" },
    content: {
      descriptions: null,
      properties: {
        id: {
          descriptions: [{ en: "Identifier of the created offer", fr: null }],
        },
      },
    },
  },
} as const satisfies DocRoute;
