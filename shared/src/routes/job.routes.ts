import { zApiJobRoutes } from "api-alternance-sdk";

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
} as const satisfies IRoutesDef;
