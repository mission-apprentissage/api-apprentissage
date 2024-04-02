import { z } from "zod";

import { IRoutesDef } from "../common.routes";

export const zSiretUaisRoutes = {
  post: {
    "/experimental/siret_uai": {
      method: "post",
      path: "/experimental/siret_uai",
      body: z
        .object({
          couple: z
            .object({
              uai: z.string().optional(),
              siret: z.string().optional(),
            })
            .strict(),
          date: z.date().optional(),
          certification: z.string().optional(),
        })
        .strict(),
      response: {
        // TODO once the specification are stable
        "200": z.unknown(),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
