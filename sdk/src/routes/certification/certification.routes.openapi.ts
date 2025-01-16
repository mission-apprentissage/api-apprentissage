import { getCertificationsRouteDoc } from "../../docs/routes/getCertifications/getCertifications.route.doc.js";
import { addErrorResponseOpenApi } from "../../models/errors/errors.model.openapi.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const certificationsRoutesOpenapi = {
  "/certification/v1": {
    get: {
      tag: "certifications",
      schema: addErrorResponseOpenApi({
        operationId: "getCertifications",
        security: [{ "api-key": [] }],
        parameters: [
          {
            schema: {
              type: "string",
              pattern: "^([A-Z0-9]{3}\\d{3}[A-Z0-9]{2}|null)?$",
            },
            required: false,
            allowEmptyValue: true,
            name: "identifiant.cfd",
            in: "query",
          },
          {
            schema: {
              type: "string",
              pattern: "^(RNCP\\d{3,5}|null)?$",
            },
            required: false,
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
      doc: getCertificationsRouteDoc,
    },
  },
} as const satisfies OpenapiRoutes;
