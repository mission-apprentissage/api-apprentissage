import { jobApplyRouteDoc } from "../../docs/routes/jobApply/jobApply.route.doc.js";
import { jobOfferCreateRouteDoc } from "../../docs/routes/jobOfferCreate/jobOfferCreate.route.doc.js";
import { jobOfferUpdateRouteDoc } from "../../docs/routes/jobOfferUpdate/jobOfferUpdate.route.doc.js";
import { jobSearchRouteDoc } from "../../docs/routes/jobSearch/jobSearch.route.doc.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const jobRoutesOpenapi = {
  "/job/v1/search": {
    get: {
      tag: "job",
      doc: jobSearchRouteDoc,
      schema: {
        operationId: "jobSearch",
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
              enum: ["3", "4", "5", "6", "7"],
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
        },
      },
    },
  },
  "/job/v1/offer": {
    post: {
      tag: "job",
      doc: jobOfferCreateRouteDoc,
      schema: {
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
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                  },
                  required: ["id"],
                },
              },
            },
          },
        },
      },
    },
  },
  "/job/v1/offer/{id}": {
    put: {
      tag: "job",
      doc: jobOfferUpdateRouteDoc,
      schema: {
        operationId: "jobOfferUpdate",
        security: [{ "api-key": ["jobs:write"] }],
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
          "204": {},
        },
      },
    },
  },
  "/job/v1/apply": {
    post: {
      tag: "job",
      doc: jobApplyRouteDoc,
      schema: {
        operationId: "jobApply",
        security: [{ "api-key": ["applications:write"] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/JobApplicationWrite",
              },
            },
          },
        },
        responses: {
          "202": {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                  },
                  required: ["id"],
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies OpenapiRoutes;
