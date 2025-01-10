import { z } from "zod";

import { zCommune } from "../../models/geographie/commune.model.js";
import { zDepartement } from "../../models/geographie/departement.model.js";
import { zMissionLocale } from "../../models/geographie/mission-locale.model.js";
import type { IApiRoutesDef } from "../common.routes.js";

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
    },
    "/geographie/v1/departement": {
      method: "get",
      path: "/geographie/v1/departement",
      response: {
        "200": zDepartement.array(),
      },
    },
    "/geographie/v1/mission-locale": {
      method: "get",
      path: "/geographie/v1/mission-locale",
      response: {
        "200": zMissionLocale.array(),
      },
    },
  },
} as const satisfies IApiRoutesDef;
