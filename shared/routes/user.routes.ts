import { z } from "zod";

import { IRoutesDef } from "./common.routes";

export const zUserRoutes = {
  get: {
    "/user/generate-api-key": {
      method: "get",
      path: "/user/generate-api-key",
      response: {
        "200": z.object({ api_key: z.string() }).strict(),
      },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
