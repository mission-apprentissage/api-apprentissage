import { z } from "zod";

import type { IApiRoutesDef } from "../common.routes.js";

export const zApiJobRoutes = {
  get: {
    "/job/v1/search": {
      method: "get",
      path: "/job/v1/search",
      querystring: z.unknown(),
      response: {
        "200": z.unknown(),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/job/v1/offer/:id": {
      method: "get",
      path: "/job/v1/offer/:id",
      params: z.object({ id: z.string() }),
      response: {
        "200": z.unknown(),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/job/v1/offer/:id/publishing-informations": {
      method: "get",
      path: "/job/v1/offer/:id/publishing-informations",
      params: z.object({ id: z.string() }),
      response: {
        "200": z.unknown(),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
  post: {
    "/job/v1/offer": {
      method: "post",
      path: "/job/v1/offer",
      body: z.unknown(),
      response: {
        "200": z.unknown(),
      },
      securityScheme: {
        auth: "api-key",
        access: "jobs:write",
        ressources: {},
      },
    },
    "/job/v1/apply": {
      method: "post",
      path: "/job/v1/apply",
      body: z.unknown(),
      response: {
        "200": z.unknown(),
      },
      securityScheme: {
        auth: "api-key",
        access: "applications:write",
        ressources: {},
      },
    },
  },
  put: {
    "/job/v1/offer/:id": {
      method: "put",
      path: "/job/v1/offer/:id",
      params: z.object({ id: z.string() }),
      body: z.unknown(),
      response: {
        "204": z.unknown(),
      },
      securityScheme: {
        auth: "api-key",
        access: "jobs:write",
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;
