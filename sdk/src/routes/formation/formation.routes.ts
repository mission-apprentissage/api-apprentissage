import { z } from "zod";

import {
  zNiveauDiplomeEuropeen,
  zRncp,
  zRomeCodeCsvParam,
} from "../../models/certification/certification.primitives.js";
import { zFormation } from "../../models/index.js";
import { zPaginationInfo, zPaginationQuery } from "../../models/pagination/pagination.model.js";
import type { IApiRoutesDef } from "../common.routes.js";

export const zFormationSearchApiQuery = zPaginationQuery
  .extend({
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
    target_diploma_level: zNiveauDiplomeEuropeen.optional(),
    romes: zRomeCodeCsvParam.optional(),
    rncp: zRncp.optional(),
    include_archived: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true")
      .pipe(z.boolean()),
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

export const zFormationSearchApiResult = z.object({
  data: zFormation.array(),
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
