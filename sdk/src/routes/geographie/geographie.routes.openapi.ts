import { communeSearchRouteDoc } from "../../docs/routes/communeSearch/communeSearch.route.doc.js";
import { listDepartementsRouteDoc } from "../../docs/routes/listDepartements/listDepartements.route.doc.js";
import { listMissionLocalesRouteDoc } from "../../docs/routes/listMissionLocales/listMissionLocales.route.doc.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const geographieRoutesOpenapi = {
  "/geographie/v1/commune/search": {
    get: {
      tag: "geographie",
      schema: {
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
      doc: communeSearchRouteDoc,
    },
  },
  "/geographie/v1/departement": {
    get: {
      tag: "geographie",
      schema: {
        operationId: "listDepartements",
        security: [{ "api-key": [] }],
        responses: {
          "200": {
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
      doc: listDepartementsRouteDoc,
    },
  },
  "/geographie/v1/mission-locale": {
    get: {
      tag: "geographie",
      schema: {
        operationId: "listMissionLocales",
        security: [{ "api-key": [] }],
        responses: {
          "200": {
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
      doc: listMissionLocalesRouteDoc,
    },
  },
} as const satisfies OpenapiRoutes;
