import type { OpenApiBuilder } from "openapi3-ts/oas31";
import { z } from "zod";

import { zCertification } from "../../models/certification/certification.model.js";
import { zCfdParam, zRncpParam } from "../../models/certification/certification.primitives.js";
import { addErrorResponseOpenApi } from "../../models/errors/errors.model.openapi.js";
import type { IApiRoutesDef } from "../common.routes.js";

export const zApiCertificationsRoutes = {
  get: {
    "/certification/v1": {
      method: "get",
      path: "/certification/v1",
      querystring: z.object({
        "identifiant.cfd": zCfdParam.optional(),
        "identifiant.rncp": zRncpParam.optional(),
      }),
      response: {
        "200": z.array(zCertification),
      },
      openapi: {
        tags: ["Certifications"] as string[],
        summary: "Récupération des certifications",
        description:
          "Récupère la liste des certifications et leur historique. Il est possible de filter cette liste par `identifiant.cfd` et `identifiant.rncp`",
        operationId: "getCertifications",
      },
    },
  },
} as const satisfies IApiRoutesDef;

export function registerCertificationRoutes(builder: OpenApiBuilder): OpenApiBuilder {
  return builder.addPath("/certification/v1", {
    get: addErrorResponseOpenApi({
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
      },
    }),
  });
}
