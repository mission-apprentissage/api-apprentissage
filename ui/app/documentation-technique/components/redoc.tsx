"use client";

import { RedocStandalone } from "redoc";

import { publicConfig } from "@/config.public";

export default function RedocPageClient({ nonce, locale }: { nonce: string; locale: string }) {
  return (
    <RedocStandalone
      specUrl={`${publicConfig.apiEndpoint}/documentation/json`}
      options={{
        sortPropsAlphabetically: false,
        sortEnumValuesAlphabetically: true,
        sortOperationsAlphabetically: false,
        sortTagsAlphabetically: false,
        menuToggle: true,
        hideSchemaTitles: false,
        pathInMiddlePanel: true,
        theme: {
          typography: {
            links: {
              textDecoration: "none",
            },
          },
        },
        labels:
          locale === "fr"
            ? {
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
              }
            : {},
        nonce,
      }}
      onLoaded={(...args) => {
        console.log(args);
      }}
    />
  );
}
