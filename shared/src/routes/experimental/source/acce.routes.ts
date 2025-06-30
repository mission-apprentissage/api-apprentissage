import type { IApiRoutesDef } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

import {
  zAcceUai,
  zAcceUaiFille,
  zAcceUaiMere,
  zAcceUaiSpec,
  zAcceUaiZone,
} from "../../../models/source/acce/source.acce.model.js";

const zQuery = z.object({
  uai: z.optional(z.string()),
  limit: z.optional(z.coerce.number()),
  skip: z.optional(z.coerce.number()),
});

export type ISourceAcceQuerystring = z.output<typeof zQuery>;

export const zSourceAcceRoutes = {
  get: {
    "/experimental/source/acce": {
      method: "get",
      path: "/experimental/source/acce",
      querystring: zQuery,
      response: {
        "200": z.array(zAcceUai.shape.data),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/experimental/source/acce/zone": {
      method: "get",
      path: "/experimental/source/acce/zone",
      querystring: zQuery,
      response: {
        "200": z.array(zAcceUaiZone.shape.data),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/experimental/source/acce/specialite": {
      method: "get",
      path: "/experimental/source/acce/specialite",
      querystring: zQuery,
      response: {
        "200": z.array(zAcceUaiSpec.shape.data),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/experimental/source/acce/mere": {
      method: "get",
      path: "/experimental/source/acce/mere",
      querystring: zQuery,
      response: {
        "200": z.array(zAcceUaiMere.shape.data),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/experimental/source/acce/fille": {
      method: "get",
      path: "/experimental/source/acce/fille",
      querystring: zQuery,
      response: {
        "200": z.array(zAcceUaiFille.shape.data),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;
