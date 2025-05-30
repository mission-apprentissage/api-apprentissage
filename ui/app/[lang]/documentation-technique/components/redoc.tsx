"use client";

import { RedocStandalone } from "redoc";

import type { Lang } from "@/app/i18n/settings";
import { publicConfig } from "@/config.public";

export default function RedocPageClient({ nonce, lang }: { nonce: string; lang: Lang }) {
  return (
    <RedocStandalone
      // Use key in order to force re-rendering when lang changes
      key={lang}
      specUrl={`${publicConfig.apiEndpoint}/swagger.json?lang=${lang}`}
      options={{
        disableSearch: true,
        sortPropsAlphabetically: false,
        sortEnumValuesAlphabetically: true,
        sortOperationsAlphabetically: false,
        sortTagsAlphabetically: false,
        schemaExpansionLevel: 3,
        expandDefaultServerVariables: true,
        expandResponses: "200,201,203,204,205",
        jsonSampleExpandLevel: 3,
        expandSingleSchemaField: true,
        menuToggle: true,
        simpleOneOfTypeLabel: true,
        hideSchemaTitles: false,
        pathInMiddlePanel: true,
        requiredPropsFirst: true,
        theme: {
          typography: {
            links: {
              textDecoration: "none",
            },
          },
        },
        labels:
          lang === "fr"
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
    />
  );
}
