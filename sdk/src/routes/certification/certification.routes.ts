import { z } from "zod/v4-mini";

import { zCertification } from "../../models/certification/certification.model.js";
import { zCfdParam, zRncpParam } from "../../models/certification/certification.primitives.js";
import type { IApiRoutesDef } from "../common.routes.js";

export const zApiCertificationsRoutes = {
  get: {
    "/certification/v1": {
      method: "get",
      path: "/certification/v1",
      querystring: z.object({
        "identifiant.cfd": zCfdParam,
        "identifiant.rncp": zRncpParam,
      }),
      response: {
        "200": z.array(zCertification),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;
