import type { IApiRoutesDef } from "api-alternance-sdk"
import { z } from "zod/v4-mini"

export const zCoreRoutes = {
  get: {
    "/healthcheck": {
      method: "get",
      path: "/healthcheck",
      response: {
        "200": z.object({
          name: z.string(),
          version: z.string(),
          env: z.enum(["local", "recette", "production", "preview", "test"]),
        }),
      },
      securityScheme: null,
    },
  },
} as const satisfies IApiRoutesDef
