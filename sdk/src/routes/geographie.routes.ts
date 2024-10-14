import { z } from "zod";

import { zCommune } from "../models/index.js";
import type { IApiRoutesDef } from "./common.routes.js";

const zCode = z.string().regex(/^\d{5}$/);

export const zApiGeographieRoutes = {
  get: {
    "/geographie/v1/commune/search": {
      method: "get",
      path: "/geographie/v1/commune/search",
      querystring: z.object({
        code: zCode,
      }),
      response: {
        "200": zCommune.array(),
      },
      openapi: {
        tags: ["Commune"] as string[],
        summary: "Recherche de commune",
        description: "Recherche de communes par code insee ou postal",
        operationId: "searchCommune",
      },
    },
  },
} as const satisfies IApiRoutesDef;
