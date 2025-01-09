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
      openapi: {
        tags: ["Géographie"] as string[],
        summary: "Recherche de commune",
        description: "Recherche de communes par code insee ou postal",
        operationId: "searchCommune",
      },
    },
    "/geographie/v1/departement": {
      method: "get",
      path: "/geographie/v1/departement",
      response: {
        "200": zDepartement.array(),
      },
      openapi: {
        tags: ["Géographie"] as string[],
        summary: "Récupération des départements français",
        description:
          "Récupération des départements français, pour des raisons pratiques les collectivités et territoires d'outre-mer sont inclus et assimilés à des départements",
        operationId: "listDepartements",
      },
    },
    "/geographie/v1/mission-locale": {
      method: "get",
      path: "/geographie/v1/mission-locale",
      response: {
        "200": zMissionLocale.array(),
      },
      openapi: {
        tags: ["Géographie"] as string[],
        summary: "Récupération des missions locales",
        description: "Récupération des mission locales",
        operationId: "listMissionLocales",
      },
    },
  },
} as const satisfies IApiRoutesDef;
