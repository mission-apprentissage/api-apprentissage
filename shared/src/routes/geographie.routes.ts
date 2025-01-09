import { zApiGeographieRoutes } from "api-alternance-sdk";

import type { IRoutesDef } from "./common.routes.js";

export const zGeographieRoutes = {
  get: {
    "/geographie/v1/commune/search": {
      ...zApiGeographieRoutes.get["/geographie/v1/commune/search"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/geographie/v1/departement": {
      ...zApiGeographieRoutes.get["/geographie/v1/departement"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/geographie/v1/mission-locale": {
      ...zApiGeographieRoutes.get["/geographie/v1/mission-locale"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
