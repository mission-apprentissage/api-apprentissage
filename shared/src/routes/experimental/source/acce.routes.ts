import { z } from "zod";

import {
  zAcceUai,
  zAcceUaiFille,
  zAcceUaiMere,
  zAcceUaiSpec,
  zAcceUaiZone,
} from "../../../models/source/acce/source.acce.model.js";
import type { IRoutesDef } from "../../common.routes.js";

const zQuery = z.object({
  uai: z.string().optional(),
  limit: z.coerce
    .number()
    .optional()
    .describe("Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats."),
  skip: z.coerce.number().optional().describe("Si renseigné, ignore les N premiers résultats."),
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
} as const satisfies IRoutesDef;
