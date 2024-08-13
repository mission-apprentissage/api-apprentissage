import { zApiOrganismesRoutes } from "api-alternance-sdk";

import { IRoutesDef } from "./common.routes.js";

export const zOrganismesRoutes = {
  get: {
    "/organisme/v1/recherche": {
      ...zApiOrganismesRoutes.get["/organisme/v1/recherche"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
