import { zodOpenApi } from "api-alternance-sdk/internal";
import type { OpenApiBuilder, ResponsesObject } from "openapi3-ts/oas31";

import type { IRoutesDef } from "./common.routes.js";

export const zCoreRoutes = {
  get: {
    "/healthcheck": {
      method: "get",
      path: "/healthcheck",
      response: {
        "200": zodOpenApi
          .object({
            name: zodOpenApi.string(),
            version: zodOpenApi.string(),
            env: zodOpenApi.enum(["local", "recette", "production", "preview", "test"]),
          })
          .describe("Statut de l'application")
          .strict(),
      },
      securityScheme: null,
      openapi: {
        tags: ["Système"] as string[],
      },
    },
  },
} as const satisfies IRoutesDef;

export function registerHealhcheckRoutes(builder: OpenApiBuilder, errorResponses: ResponsesObject): OpenApiBuilder {
  return builder.addPath("/healthcheck", {
    get: {
      tags: ["Système"],
      security: [],
      responses: {
        "200": {
          description: "Statut de l'application",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "api" },
                  version: { type: "string", example: "1.0.0" },
                  env: {
                    type: "string",
                    enum: ["local", "recette", "production", "preview", "test"],
                  },
                },
                required: ["name", "version", "env"],
                additionalProperties: false,
                description: "Statut de l'application",
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
}
