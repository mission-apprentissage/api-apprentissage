import type { DocRoute } from "../../types.js";

export const jobOfferCreateRouteDoc = {
  summary: "Send an apprenticeship job offer",
  description:
    "This API allows you to maximize the visibility of your apprenticeship job offers by sharing them with the La bonne alternance service, which then automatically redistributes them to the most relevant candidates on its site as well as its partner sites.",
  response: {
    description: "Success",
    content: {
      description: null,
      _: {
        id: {
          description: { en: "Identifier of the created offer", fr: null },
        },
      },
    },
  },
} as const satisfies DocRoute;
