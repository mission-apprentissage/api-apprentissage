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
      descriptions: [{ en: "URL of the export", fr: "URL de l'export" }],
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
