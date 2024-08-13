import { zodOpenApi } from "api-alternance-sdk/internal";

import { IRoutesDef } from "./common.routes.js";

export const zCoreRoutes = {
  get: {
    "/healthcheck": {
      method: "get",
      path: "/healthcheck",
      response: {
        "200": zodOpenApi
          .object({
            name: zodOpenApi.string().openapi({
              example: "api",
            }),
            version: zodOpenApi.string().openapi({
              example: "1.0.0",
            }),
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
    "/healthcheck/sentry": {
      method: "get",
      path: "/healthcheck/sentry",
      response: {
        "200": zodOpenApi.never(),
      },
      securityScheme: null,
    },
  },
} as const satisfies IRoutesDef;
