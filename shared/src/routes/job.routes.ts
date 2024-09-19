import { zApiJobRoutes } from "api-alternance-sdk";
import {
  getDocOpenAPIAttributes,
  jobOfferCreateRouteDoc,
  jobOfferUpdateRouteDoc,
  jobSearchRouteDoc,
} from "api-alternance-sdk/internal";
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
        summary: jobSearchRouteDoc.summary,
        description: jobSearchRouteDoc.description,
        operationId: "jobSearch",
        security: [{ "api-key": [] }],
        parameters: [
          {
            schema: {
              ...getDocOpenAPIAttributes(jobSearchRouteDoc.parameters.longitude),
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
              ...getDocOpenAPIAttributes(jobSearchRouteDoc.parameters.latitude),
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
              ...getDocOpenAPIAttributes(jobSearchRouteDoc.parameters.radius),
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
            schema: {
              ...getDocOpenAPIAttributes(jobSearchRouteDoc.parameters.target_diploma_level),
              type: "string",
              enum: ["3", "4", "5", "6", "7"],
            },
            required: false,
            name: "target_diploma_level",
            in: "query",
          },
          {
            schema: {
              ...getDocOpenAPIAttributes(jobSearchRouteDoc.parameters.romes),
              type: "string",
            },
            required: false,
            name: "romes",
            in: "query",
          },
          {
            schema: {
              ...getDocOpenAPIAttributes(jobSearchRouteDoc.parameters.rncp),
              type: "string",
              pattern: "^RNCP\\d{3,5}$",
            },
            required: false,
            name: "rncp",
            in: "query",
          },
        ],
        responses: {
          "200": {
            description: jobSearchRouteDoc.response.description,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jobs: {
                      ...getDocOpenAPIAttributes(jobSearchRouteDoc.response._.jobs),
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/JobOfferRead",
                      },
                    },
                    recruiters: {
                      ...getDocOpenAPIAttributes(jobSearchRouteDoc.response._.recruiters),
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/JobRecruiter",
                      },
                    },
                    warnings: {
                      ...getDocOpenAPIAttributes(jobSearchRouteDoc.response._.warnings),
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          message: {
                            type: "string",
                          },
                          code: {
                            type: "string",
                          },
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
        summary: jobOfferCreateRouteDoc.summary,
        description: jobOfferCreateRouteDoc.description,
        operationId: "jobOfferCreate",
        security: [{ "api-key": ["jobs:write"] }],
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
            description: jobOfferCreateRouteDoc.response.description,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", ...getDocOpenAPIAttributes(jobOfferCreateRouteDoc.response._.id) },
                  },
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
        summary: jobOfferUpdateRouteDoc.summary,
        description: jobOfferUpdateRouteDoc.description,
        operationId: "jobOfferUpdate",
        security: [{ "api-key": ["jobs:write"] }],
        parameters: [
          {
            schema: { type: "string", ...getDocOpenAPIAttributes(jobOfferUpdateRouteDoc.parameters.id) },
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
            description: jobOfferUpdateRouteDoc.response.description,
          },
          ...errorResponses,
        },
      },
    });
}
