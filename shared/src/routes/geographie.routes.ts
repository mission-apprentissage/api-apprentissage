import { zApiGeographieRoutes } from "api-alternance-sdk";
import { addOperationDoc, communeSearchRouteDoc, listDepartementsRouteDoc } from "api-alternance-sdk/internal";
import type { OpenApiBuilder } from "openapi3-ts/oas31";

import type { IRoutesDef } from "./common.routes.js";

export const zGeographieRoutes = {
  get: {
    "/geographie/v1/commune/search": {
      ...zApiGeographieRoutes.get["/geographie/v1/commune/search"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/geographie/v1/departement": {
      ...zApiGeographieRoutes.get["/geographie/v1/departement"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;

export function registerGeographieRoutes(builder: OpenApiBuilder, lang: "en" | "fr"): OpenApiBuilder {
  return builder
    .addPath("/geographie/v1/commune/search", {
      get: addOperationDoc(
        {
          tags: ["Géographie"],
          operationId: "communeSearch",
          security: [{ "api-key": [] }],
          parameters: [
            {
              schema: {
                type: "string",
                pattern: "^\\d{5}$",
              },
              required: true,
              name: "code",
              in: "query",
            },
          ],
          responses: {
            "200": {
              description: communeSearchRouteDoc.response.description,
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Commune",
                    },
                  },
                },
              },
            },
          },
        },
        communeSearchRouteDoc,
        lang
      ),
    })
    .addPath("/geographie/v1/departement", {
      get: addOperationDoc(
        {
          tags: ["Géographie"],
          operationId: "listDepartements",
          security: [{ "api-key": [] }],
          responses: {
            "200": {
              description: listDepartementsRouteDoc.response.description,
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Departement",
                    },
                  },
                },
              },
            },
          },
        },
        listDepartementsRouteDoc,
        lang
      ),
    });
}
