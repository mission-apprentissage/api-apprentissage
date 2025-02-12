import { z } from "zod";

import { zCommune } from "../../models/geographie/commune.model.js";
import { zDepartement } from "../../models/geographie/departement.model.js";
import { zMissionLocale } from "../../models/geographie/mission-locale.model.js";
import type { IApiRoutesDef } from "../common.routes.js";

const zCode = z.string().regex(/^\d{5}$/);

const zMissionLocaleSearchApiQuery = z
  .object({
    latitude: z.coerce
      .number()
      .min(-90, "Latitude doit être comprise entre -90 et 90")
      .max(90, "Latitude doit être comprise entre -90 et 90")
      .optional(),
    longitude: z.coerce
      .number()
      .min(-180, "Longitude doit être comprise entre -180 et 180")
      .max(180, "Longitude doit être comprise entre -180 et 180")
      .optional(),
    radius: z.coerce.number().min(0).max(200).default(30),
  })
  .superRefine((data, ctx) => {
    if (data.longitude == null && data.latitude != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["longitude"],
        message: "La longitude est requise lorsque la latitude est fournie",
      });
    }

    if (data.longitude != null && data.latitude == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["latitude"],
        message: "La latitude est requise lorsque la longitude est fournie",
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
        "200": zCommune.array(),
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
        "200": zDepartement.array(),
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
