import type { DocRoute } from "../../types.js";
import descriptionEn from "./docs/en/description.doc.md.js";
import descriptionFr from "./docs/fr/description.doc.md.js";

export const jobApplyRouteDoc = {
  summary: {
    en: "Send an application to a job offer or a company.",
    fr: "Envoyer une candidature à une offre ou à une entreprise.",
  },
  description: {
    en: descriptionEn,
    fr: descriptionFr,
  },
  response: {
    description: { en: "Success", fr: "Succès" },
    content: {
      descriptions: null,
      _: {
        id: {
          descriptions: [{ fr: "Identifiant de la candidature.", en: "Application's identifier." }],
        },
      },
    },
  },
} as const satisfies DocRoute;
