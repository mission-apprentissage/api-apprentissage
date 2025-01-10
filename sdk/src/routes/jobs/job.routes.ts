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
    },
    "/job/v1/apply": {
      method: "post",
      path: "/job/v1/apply",
      body: z.unknown(),
      response: {
        "200": z.unknown(),
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
    },
  },
} as const satisfies IApiRoutesDef;
