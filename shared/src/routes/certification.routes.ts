import { zApiCertificationsRoutes } from "api-alternance-sdk";
import type { OpenApiBuilder, ResponsesObject } from "openapi3-ts/oas31";

import type { IRoutesDef } from "./common.routes.js";

export const zCertificationsRoutes = {
  get: {
    "/certification/v1": {
      ...zApiCertificationsRoutes.get["/certification/v1"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;

export function registerCertificationRoutes(builder: OpenApiBuilder, errorResponses: ResponsesObject): OpenApiBuilder {
  return builder.addPath("/certification/v1", {
    get: {
      tags: ["Certifications"],
      summary: "Récupération des certifications",
      description: "Récupère la liste des certifications, filtrée par `identifiant.cfd` et `identifiant.rncp`",
      operationId: "getCertifications",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: {
            type: "string",
            pattern: "^([A-Z0-9]{3}\\d{3}[A-Z0-9]{2}|null)?$",
            examples: ["46X32402", "", "null"],
          },
          required: false,
          description:
            "Filtre la liste des certifications par `identifiant.cfd`\n\n- Si la valeur est vide ou `null`, filtre avec `identifiant.cfd = null`\n\n- Si la valeur est absente, aucun filtre n'est appliqué\n\n- Sinon doit respecter le regex `/^[A-Z0-9]{3}\\d{3}[A-Z0-9]{2}$/`",
          allowEmptyValue: true,
          name: "identifiant.cfd",
          in: "query",
        },
        {
          schema: {
            type: "string",
            pattern: "^(RNCP\\d{3,5}|null)?$",
            examples: ["RNCP12345", "", "null"],
          },
          required: false,
          description:
            "Filtre la liste des certifications par `identifiant.rncp`\n\n- Si la valeur est vide ou `null`, filtre avec `identifiant.rncp = null`\n\n- Si la valeur est absente, aucun filtre n'est appliqué\n\n- Sinon doit respecter le regex `/^RNCP\\d{3,5}$/`",
          allowEmptyValue: true,
          name: "identifiant.rncp",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "Liste des certifications",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Certification",
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
}
