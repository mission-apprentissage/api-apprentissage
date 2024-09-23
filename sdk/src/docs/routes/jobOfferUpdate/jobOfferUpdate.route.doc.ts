import type { DocRoute } from "../../types.js";

export const jobOfferUpdateRouteDoc = {
  summary: "Modify a work-study job offer.",
  description:
    "This API allows you to maximize the visibility of your work-study job offers by sharing them with the service La bonne alternance, which then automatically distributes them closer to candidates on its site and its partner sites.",
  parameters: {
    id: {
      description: { en: null, fr: "Identifiant unique de l’opportunité d’emploi" },
      examples: ["6687165396d52b5e01b409545"],
    },
  },
  response: {
    description: "Success",
  },
} as const satisfies DocRoute;
