import type { DocTechnicalField } from "../../types.js";

export const offerPublishingModelDoc = {
  descriptions: [
    { en: "Publishing informations of the offer", fr: "Informations sur la publication de l'offre d'emploi" },
  ],
  properties: {
    publishing: {
      descriptions: [
        { en: "Publishing informations of the offer", fr: "Informations sur la publication de l'offre d'emploi" },
      ],
      properties: {
        status: {
          descriptions: [
            {
              en: "State of the publishing. If the value is WILL_NOT_BE_PUBLISHED, the offer will not be published.",
              fr: "Etat de la publication. Si la valeur vaut WILL_NOT_BE_PUBLISHED, l'offre ne sera pas publiée.",
            },
          ],
          examples: ["WILL_BE_PUBLISHED", "PUBLISHED", "WILL_NOT_BE_PUBLISHED"],
        },
        error: {
          descriptions: [
            {
              en: "Object containing the error",
              fr: "Objet contenant l'erreur",
            },
          ],
          properties: {
            code: {
              descriptions: [
                {
                  en: "Code of the error. This code will not change.",
                  fr: "Code de l'erreur. Ce code ne changera pas.",
                },
              ],
              examples: [
                "CLOSED_COMPANY",
                "DUPLICATE",
                "STAGE",
                "EXPIRED",
                "CFA",
                "ROME_BLACKLISTED",
                "WRONG_DATA",
                "NON_DIFFUSIBLE",
              ],
            },
            label: {
              descriptions: [{ en: "Error description", fr: "Description de l'erreur" }],
              examples: ["WILL_BE_PUBLISHED", "PUBLISHED", "WILL_NOT_BE_PUBLISHED"],
            },
          },
        },
      },
    },
  },
} as const satisfies DocTechnicalField;
