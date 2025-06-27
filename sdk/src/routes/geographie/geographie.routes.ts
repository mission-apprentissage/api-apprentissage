import { z } from "zod/v4-mini";

import { zCommune } from "../../models/geographie/commune.model.js";
import { zDepartement } from "../../models/geographie/departement.model.js";
import { zMissionLocale } from "../../models/geographie/mission-locale.model.js";
import type { IApiRoutesDef } from "../common.routes.js";

const zCode = z.string().check(z.regex(/^\d{5}$/));

const zMissionLocaleSearchApiQuery = z
  .object({
    latitude: z.optional(
      z.coerce
        .number()
        .check(
          z.gte(-90, "Latitude doit être comprise entre -90 et 90"),
          z.lte(90, "Latitude doit être comprise entre -90 et 90")
        )
    ),
    longitude: z.optional(
      z.coerce
        .number()
        .check(
          z.gte(-180, "Longitude doit être comprise entre -180 et 180"),
          z.lte(180, "Longitude doit être comprise entre -180 et 180")
        )
    ),
    radius: z._default(z.coerce.number().check(z.gte(0), z.lte(200)), 30),
  })
  .check((ctx) => {
    if (ctx.value.longitude == null && ctx.value.latitude != null) {
      ctx.issues.push({
        code: "custom",
        path: ["longitude"],
        message: "La longitude est requise lorsque la latitude est fournie",
        input: ctx.value,
      });
    }

    if (ctx.value.longitude != null && ctx.value.latitude == null) {
      ctx.issues.push({
        code: "custom",
        path: ["latitude"],
        message: "La latitude est requise lorsque la longitude est fournie",
        input: ctx.value,
      });
    }
  });

export type IMissionLocaleSearchApiQuery = z.output<typeof zMissionLocaleSearchApiQuery>;

export const zApiGeographieRoutes = {
  get: {
    "/geographie/v1/commune/search": {
      method: "get",
      path: "/geographie/v1/commune/search",
      querystring: z.object({
        code: zCode,
      }),
      response: {
        "200": z.array(zCommune),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/geographie/v1/departement": {
      method: "get",
      path: "/geographie/v1/departement",
      response: {
        "200": z.array(zDepartement),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/geographie/v1/mission-locale": {
      method: "get",
      path: "/geographie/v1/mission-locale",
      querystring: zMissionLocaleSearchApiQuery,
      response: {
        "200": z.array(zMissionLocale),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;
