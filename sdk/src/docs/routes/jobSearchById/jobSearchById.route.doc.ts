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
      descriptions: [{ en: "Unique identifier of the job offer", fr: "Identifiant unique de l’opportunité d’emploi" }],
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

export const jobSearchByIdPublishingRouteDoc = {
  summary: { fr: "Etat de la dernière publication de l'offre", en: "State of the last publishing of the offer" },
  description: {
    en: "This endpoint gives informations about the state of the last publishing of the offer. Indeed, the publishing of an offer can take up to 10 minutes.",
    fr: "Cette route donne des informations sur l'état de la dernière publication de l'offre. En effet, la publication d'une offre peut prendre jusqu'à 10 minutes.",
  },
  parameters: {
    id: {
      descriptions: [{ en: "Unique identifier of the job offer", fr: "Identifiant unique de l’opportunité d’emploi" }],
      examples: ["6687165396d52b5e01b409545"],
    },
  },
  response: {
    description: { en: "Success", fr: "Succès" },
    content: {
      descriptions: [
        {
          en: "Last publising informations of the offer",
          fr: "Informations de la dernière publication de l'offre",
        },
      ],
    },
  },
} as const satisfies DocRoute;
