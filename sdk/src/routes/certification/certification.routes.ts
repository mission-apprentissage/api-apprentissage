import { z } from "zod";

import { zCertification } from "../../models/certification/certification.model.js";
import { zCfdParam, zRncpParam } from "../../models/certification/certification.primitives.js";
import type { IApiRoutesDef } from "../common.routes.js";

export const zApiCertificationsRoutes = {
  get: {
    "/certification/v1": {
      method: "get",
      path: "/certification/v1",
      querystring: z.object({
        "identifiant.cfd": zCfdParam.optional(),
        "identifiant.rncp": zRncpParam.optional(),
      }),
      response: {
        "200": z.array(zCertification),
      },
    },
  },
} as const satisfies IApiRoutesDef;
