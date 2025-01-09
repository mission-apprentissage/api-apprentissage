import type { OpenApiBuilder } from "openapi3-ts/oas31";

import { communeSearchRouteDoc } from "../../docs/routes/communeSearch/communeSearch.route.doc.js";
import { listDepartementsRouteDoc } from "../../docs/routes/listDepartements/listDepartements.route.doc.js";
import { listMissionLocalesRouteDoc } from "../../docs/routes/listMissionLocales/listMissionLocales.route.doc.js";
import { addOperationDoc } from "../../utils/zodWithOpenApi.js";

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
    })
    .addPath("/geographie/v1/mission-locale", {
      get: addOperationDoc(
        {
          tags: ["Géographie"],
          operationId: "listMissionLocales",
          security: [{ "api-key": [] }],
          responses: {
            "200": {
              description: listMissionLocalesRouteDoc.response.description,
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/MissionLocale",
                    },
                  },
                },
              },
            },
          },
        },
        listMissionLocalesRouteDoc,
        lang
      ),
    });
}
