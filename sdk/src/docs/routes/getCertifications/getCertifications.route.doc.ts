import { certificationsPageSummaryDoc } from "../../metier/certifications/certifications.doc.js";
import type { DocRoute } from "../../types.js";

export const getCertificationsRouteDoc = {
  summary: certificationsPageSummaryDoc.title,
  description: {
    fr: "Récupère la liste des certifications, filtrée par `identifiant.cfd` et `identifiant.rncp`",
    en: "Retrieve the list of certifications, filtered by `identifiant.cfd` and `identifiant.rncp`",
  },
  parameters: {
    "identifiant.cfd": {
      descriptions: [
        { en: null, fr: "Filtre la liste des certifications par `identifiant.cfd`" },
        { en: null, fr: "- Si la valeur est vide ou `null`, filtre avec `identifiant.cfd = null`" },
        { en: null, fr: "- Si la valeur est absente, aucun filtre n'est appliqué" },
        { en: null, fr: "- Sinon doit respecter le regex `/^[A-Z0-9]{3}\\d{3}[A-Z0-9]{2}$/`" },
      ],
      examples: ["46X32402", "", "null"],
    },
    "identifiant.rncp": {
      descriptions: [
        { en: null, fr: "Filtre la liste des certifications par `identifiant.rncp`" },
        { en: null, fr: "- Si la valeur est vide ou `null`, filtre avec `identifiant.rncp = null`" },
        { en: null, fr: "- Si la valeur est absente, aucun filtre n'est appliqué" },
        { en: null, fr: "- Sinon doit respecter le regex `/^RNCP\\d{3,5}$/`" },
      ],
      examples: ["RNCP12345", "", "null"],
    },
  },
  response: {
    description: {
      en: "Success",
      fr: "Succès",
    },
    content: {
      descriptions: [
        {
          fr: "Liste des communes correspondant au code INSEE ou postal recherché",
          en: "List of communes matching the INSEE or postal code searched",
        },
      ],
      items: {
        descriptions: null,
      },
    },
  },
} as const satisfies DocRoute;
