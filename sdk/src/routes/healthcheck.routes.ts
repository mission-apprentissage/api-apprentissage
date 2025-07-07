import { z } from "zod/v4-mini";
import type { IApiRoutesDef } from "api-alternance-sdk";

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
} as const satisfies IApiRoutesDef;
