import type { IApiRoutesDef } from "api-alternance-sdk";
import { addErrorResponseOpenApi, addOperationDoc } from "api-alternance-sdk/internal";
import type { OpenApiBuilder } from "openapi3-ts/oas31";
import { z } from "zod";

export const zCoreRoutes = {
  get: {
    "/healthcheck": {
      method: "get",
      path: "/healthcheck",
      response: {
        "200": z
          .object({
            name: z.string(),
            version: z.string(),
            env: z.enum(["local", "recette", "production", "preview", "test"]),
          })
          .describe("Statut de l'application")
          .strict(),
      },
      securityScheme: null,
    },
  },
} as const satisfies IApiRoutesDef;

export function registerHealhcheckRoutes(builder: OpenApiBuilder, lang: "en" | "fr"): OpenApiBuilder {
  return builder.addPath("/healthcheck", {
    get: addOperationDoc(
      {
        tag: "system",
        schema: addErrorResponseOpenApi({
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
          },
        }),
        doc: null,
      },
      lang
    ),
  });
}
