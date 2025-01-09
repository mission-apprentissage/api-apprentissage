import { zApiCertificationsRoutes } from "api-alternance-sdk";

import type { IRoutesDef } from "./common.routes.js";

export const zCertificationsRoutes = {
  get: {
    "/certification/v1": {
      ...zApiCertificationsRoutes.get["/certification/v1"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
