import { zApiJobRoutes } from "api-alternance-sdk";
import type { OpenApiBuilder, ResponsesObject } from "openapi3-ts/oas31";

import type { IRoutesDef } from "./common.routes.js";

export const zJobRoutes = {
  get: {
    "/job/v1/search": {
      ...zApiJobRoutes.get["/job/v1/search"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
  post: {
    "/job/v1/offer": {
      ...zApiJobRoutes.post["/job/v1/offer"],
      securityScheme: {
        auth: "api-key",
        access: "jobs:write",
        ressources: {},
      },
    },
  },
  put: {
    "/job/v1/offer/:id": {
      ...zApiJobRoutes.put["/job/v1/offer/:id"],
      securityScheme: {
        auth: "api-key",
        access: "jobs:write",
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;

export function registerJobRoutes(builder: OpenApiBuilder, errorResponses: ResponsesObject): OpenApiBuilder {
  return builder
    .addPath("/job/v1/search", {
      get: {
        tags: ["Job"],
        summary: "Opportunités d’emploi en alternance",
        description:
          "Accédez en temps réel à l'ensemble des opportunités d'emploi en alternance disponibles sur le territoire français et exposez les gratuitement et en marque blanche auprès de vos utilisateurs.",
        operationId: "searchJobs",
        security: [{ "api-key": [] }],
        parameters: [
          {
            schema: {
              type: ["number", "null"],
              minimum: -180,
              maximum: 180,
            },
            required: false,
            name: "longitude",
            in: "query",
          },
          {
            schema: {
              type: ["number", "null"],
              minimum: -90,
              maximum: 90,
            },
            required: false,
            name: "latitude",
            in: "query",
          },
          {
            schema: {
              type: ["number", "null"],
              minimum: 0,
              maximum: 200,
              default: 30,
            },
            required: false,
            name: "radius",
            in: "query",
          },
          {
            schema: { type: "string", enum: ["3", "4", "5", "6", "7"] },
            required: false,
            name: "target_diploma_level",
            in: "query",
          },
          {
            schema: { type: "string" },
            required: false,
            name: "romes",
            in: "query",
          },
          {
            schema: { type: "string", pattern: "^RNCP\\d{3,5}$" },
            required: false,
            name: "rncp",
            in: "query",
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jobs: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/JobOfferRead",
                      },
                    },
                    recruiters: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/JobRecruiter",
                      },
                    },
                    warnings: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          code: { type: "string" },
                        },
                        required: ["message", "code"],
                      },
                    },
                  },
                  required: ["jobs", "recruiters", "warnings"],
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    })
    .addPath("/job/v1/offer", {
      post: {
        tags: ["Job"],
        summary: "Publier une offre d'emploi en alternance",
        description: "Publiez une offre d'emploi en alternance",
        operationId: "createJobOffer",
        security: [{ "api-key": [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/JobOfferWrite",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { id: { type: "string" } },
                  required: ["id"],
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    })
    .addPath("/job/v1/offer/{id}", {
      put: {
        tags: ["Job"],
        summary: "Modification d'une offre d'emploi en alternance",
        description: "Modifiez une offre d'emploi en alternance",
        operationId: "updateJobOffer",
        security: [{ "api-key": [] }],
        parameters: [
          {
            schema: { type: "string" },
            required: true,
            name: "id",
            in: "path",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/JobOfferWrite",
              },
            },
          },
        },
        responses: {
          "204": {
            description: "",
            content: { "application/json": { schema: { type: "null" } } },
          },
          ...errorResponses,
        },
      },
    });
}
