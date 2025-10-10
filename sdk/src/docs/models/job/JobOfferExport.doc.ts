import type { DocTechnicalField } from "../../types.js";

export const offerExportModelDoc = {
  descriptions: [
    {
      en: "Informations relative to the export of the all the offers.",
      fr: "Informations concernant l'export de toutes les offres.",
    },
  ],
  properties: {
    url: {
      descriptions: [
        {
          en: "URL of the export. Provided URL is valid for 2 minutes. \n\nOffers are returned using the JSON format. The data structure of the offers is identical to the response of the [search route](/fr/documentation-technique#tag/Offre-Emploi/operation/jobSearch)",
          fr: "URL de l'export. le lien de téléchargement est valable pendant 2 minutes. \n\nLes offres sont au format JSON. La structure de données des offres est identique à la réponse de la [route de recherche](/fr/documentation-technique#tag/Offre-Emploi/operation/jobSearch)",
        },
      ],
      examples: [
        "https://s3.rbx.io.cloud.ovh.net/bucket/file.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD",
      ],
    },
    lastUpdate: {
      descriptions: [{ en: "Export date", fr: "Date de l'export" }],
      examples: ["2025-06-26T08:28:05.000Z"],
    },
  },
} as const satisfies DocTechnicalField;
