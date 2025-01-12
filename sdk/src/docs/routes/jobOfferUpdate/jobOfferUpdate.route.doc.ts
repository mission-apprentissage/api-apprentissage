import type { DocRoute } from "../../types.js";

export const jobOfferUpdateRouteDoc = {
  summary: { en: "Modify a work-study job offer.", fr: "Modifier une offre d'emploi en alternance." },
  description: {
    en: "This API allows you to maximize the visibility of your work-study job offers by sharing them with the service La bonne alternance, which then automatically distributes them closer to candidates on its site and its partner sites.",
    fr: "Cette API vous permet de maximiser la visibilité de vos offres d'emploi en alternance en les partageant avec le service La bonne alternance qui les redistribue automatiquement aux candidats les plus pertinents sur son site ainsi que sur ses sites partenaires.",
  },
  parameters: {
    id: {
      descriptions: [{ en: null, fr: "Identifiant unique de l’opportunité d’emploi" }],
      examples: ["6687165396d52b5e01b409545"],
    },
  },
  body: {
    description: null,
  },
  response: {
    description: { en: "Success", fr: "Succès" },
  },
} as const satisfies DocRoute;
