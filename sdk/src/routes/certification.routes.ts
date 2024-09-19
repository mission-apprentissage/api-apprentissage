import { z } from "zod";

import { zCertification } from "../models/index.js";
import { zCfdParam, zRncpParam } from "../models/internal.js";
import type { IApiRoutesDef } from "./common.routes.js";

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
      openapi: {
        tags: ["Certifications"] as string[],
        summary: "Récupération des certifications",
        description:
          "Récupère la liste des certifications et leur historique. Il est possible de filter cette liste par `identifiant.cfd` et `identifiant.rncp`",
        operationId: "getCertifications",
      },
    },
  },
} as const satisfies IApiRoutesDef;
