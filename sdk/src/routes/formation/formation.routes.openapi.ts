import { searchFormationsRouteDoc } from "../../docs/routes/searchFormations/searchFormations.route.doc.js";
import { addErrorResponseOpenApi } from "../../models/errors/errors.model.openapi.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const formationRoutesOpenapi = {
  "/formation/v1/search": {
    get: {
      tag: "formation",
      schema: addErrorResponseOpenApi({
        operationId: "searchFormations",
        security: [{ "api-key": [] }],
        parameters: [
          {
            schema: {
              type: "number",
              minimum: -180,
              maximum: 180,
            },
            required: false,
            name: "longitude",
            in: "query",
          },
          {
            schema: {
              type: "number",
              minimum: -90,
              maximum: 90,
            },
            required: false,
            name: "latitude",
            in: "query",
          },
          {
            schema: {
              type: "number",
              minimum: 0,
              maximum: 200,
              default: 30,
            },
            required: false,
            name: "radius",
            in: "query",
          },
          {
            schema: {
              type: "string",
              enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
            },
            required: false,
            name: "target_diploma_level",
            in: "query",
          },
          {
            schema: {
              type: "string",
            },
            required: false,
            name: "romes",
            in: "query",
          },
          {
            schema: {
              type: "string",
              pattern: "^RNCP\\d{3,5}$",
            },
            required: false,
            name: "rncp",
            in: "query",
          },
          {
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 1_000,
              default: 100,
            },
            required: false,
            name: "page_size",
            in: "query",
          },
          {
            schema: {
              type: "integer",
              minimum: 0,
              default: 0,
            },
            required: false,
            name: "page_index",
            in: "query",
          },
        ],
        responses: {
          "200": {
            description: "Liste des formations",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Formation",
                      },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page_count: { type: "integer" },
                        page_size: { type: "integer" },
                        page_index: { type: "integer" },
                      },
                      required: ["page_count", "page_size", "page_index"],
                    },
                  },
                  required: ["data", "pagination"],
                },
              },
            },
          },
        },
      }),
      doc: searchFormationsRouteDoc,
    },
  },
} as const satisfies OpenapiRoutes;
