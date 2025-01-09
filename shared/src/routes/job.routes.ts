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
  post: {
    "/job/v1/offer": {
      ...zApiJobRoutes.post["/job/v1/offer"],
      securityScheme: {
        auth: "api-key",
        access: "jobs:write",
        ressources: {},
      },
    },
    "/job/v1/apply": {
      ...zApiJobRoutes.post["/job/v1/apply"],
      securityScheme: {
        auth: "api-key",
        access: "applications:write",
        ressources: {},
      },
    },
  },
  put: {
    "/job/v1/offer/:id": {
      ...zApiJobRoutes.put["/job/v1/offer/:id"],
      securityScheme: {
        auth: "api-key",
        access: "jobs:write",
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
