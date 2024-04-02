"use client";
import "./hide-sidebar.css";

import { RedocStandalone } from "redoc";

import { publicConfig } from "../../config.public";

export const revalidate = 3_600;

export default function RedocPage() {
  return (
    <RedocStandalone
      specUrl={`${publicConfig.apiEndpoint}/documentation/json`}
      options={{
        sortPropsAlphabetically: false,
        sortEnumValuesAlphabetically: true,
        sortOperationsAlphabetically: true,
        sortTagsAlphabetically: true,
        menuToggle: true,
        hideSchemaTitles: false,
        theme: {
          spacing: {
            sectionHorizontal: 20,
            sectionVertical: 10,
          },
          sidebar: {
            width: "0px",
          },
          typography: {
            headings: {
              fontFamily: "inherit",
              fontWeight: "bold",
              lineHeight: "1.15",
            },
          },
        },
        labels: {
          enum: "Enum",
          enumSingleValue: "Valeur",
          enumArray: "Éléments",
          default: "Défaut",
          deprecated: "Déprécié",
          example: "Exemple",
          examples: "Exemples",
          recursive: "Récurssif",
          arrayOf: "Tableau de ",
          webhook: "Événement",
          const: "Valeur",
          noResultsFound: "Aucun résultat trouvé",
          download: "Télécharger",
          downloadSpecification: "Télécharger la spécification OpenAPI",
          responses: "Réponses",
          callbackResponses: "Réponses des callbacks",
          requestSamples: "Exemples de requêtes",
          responseSamples: "Exemples de réponses",
        },
      }}
    />
  );
}
