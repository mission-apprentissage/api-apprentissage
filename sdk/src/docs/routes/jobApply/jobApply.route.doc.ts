import type { DocRoute } from "../../types.js";
import descriptionEn from "./docs/en/description.doc.md.js";
import descriptionFr from "./docs/fr/description.doc.md.js";

export const jobApplyRouteDoc = {
  summary: {
    en: "Send an application to a job opportunity in apprenticeship",
    fr: "Envoi d’une candidature à une opportunité d’emploi en alternance",
  },
  description: {
    en: descriptionEn,
    fr: descriptionFr,
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
          descriptions: [{ fr: "Identifiant de la candidature.", en: "Application's identifier." }],
        },
      },
    },
  },
} as const satisfies DocRoute;
