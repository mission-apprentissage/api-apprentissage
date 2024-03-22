import { z } from "zod";

import { zCertification } from "../models/certification.model";
import { zCfdParam, zRncpParam } from "../zod/certifications.primitives";
import { IRoutesDef } from "./common.routes";

export const zCertificationsRoutes = {
  get: {
    "/certification/v1": {
      method: "get",
      path: "/certification/v1",
      querystring: z.object({
        "code.cfd": zCfdParam.optional(),
        "code.rncp": zRncpParam.optional(),
      }),
      response: {
        "200": z.array(zCertification.omit({ _id: true })),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
      openapi: {
        tags: ["Certifications"] as string[],
      },
    },
  },
} as const satisfies IRoutesDef;
