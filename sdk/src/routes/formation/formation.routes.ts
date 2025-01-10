import { z } from "zod";

import {
  zNiveauDiplomeEuropeen,
  zRncp,
  zRomeCodeCsvParam,
} from "../../models/certification/certification.primitives.js";
import { zFormation } from "../../models/index.js";
import type { IApiRoutesDef } from "../common.routes.js";

export const zFormationSearchApiQuery = z
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
    target_diploma_level: zNiveauDiplomeEuropeen.optional(),
    romes: zRomeCodeCsvParam.optional(),
    rncp: zRncp.optional(),
    page_size: z.number().int().min(1).max(1_000).default(100),
    page_index: z.number().int().min(0).default(0),
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
  pagination: z.object({
    page_count: z.number().int(),
    page_size: z.number().int(),
    page_index: z.number().int(),
  }),
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
    },
  },
} as const satisfies IApiRoutesDef;
