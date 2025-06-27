import { z } from "zod/v4-mini";

import {
  zNiveauDiplomeEuropeen,
  zRncp,
  zRomeCodeCsvParam,
} from "../../models/certification/certification.primitives.js";
import { zFormation } from "../../models/index.js";
import { zPaginationInfo, zPaginationQuery } from "../../models/pagination/pagination.model.js";
import type { IApiRoutesDef } from "../common.routes.js";

export const zFormationSearchApiQuery = z
  .extend(zPaginationQuery, {
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
    target_diploma_level: z.optional(zNiveauDiplomeEuropeen),
    romes: z.optional(zRomeCodeCsvParam),
    rncp: z.optional(zRncp),
    include_archived: z.prefault(
      z.pipe(
        z.pipe(
          z.enum(["true", "false"]),
          z.transform((v) => v === "true")
        ),
        z.boolean()
      ),
      "false"
    ),
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

export const zFormationSearchApiResult = z.object({
  data: z.array(zFormation),
  pagination: zPaginationInfo,
});

export type IFormationSearchApiQuery = z.output<typeof zFormationSearchApiQuery>;
export type IFormationSearchApiResult = z.output<typeof zFormationSearchApiResult>;

export const zApiFormationRoutes = {
  get: {
    "/formation/v1/search": {
      method: "get",
      path: "/formation/v1/search",
      querystring: zFormationSearchApiQuery,
      response: {
        "200": zFormationSearchApiResult,
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/formation/v1/:id": {
      method: "get",
      path: "/formation/v1/:id",
      params: z.object({ id: z.string() }),
      response: {
        "200": zFormation,
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
  post: {
    "/formation/v1/appointment/generate-link": {
      method: "post",
      path: "/formation/v1/appointment/generate-link",
      body: z.unknown(),
      response: {
        "200": z.unknown(),
      },
      securityScheme: {
        auth: "api-key",
        access: "appointments:write",
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;
