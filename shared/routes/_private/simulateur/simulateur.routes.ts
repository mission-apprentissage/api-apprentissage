import { z } from "zod";

import { zSourceNpecNormalizedData } from "../../../models/source/npec/source.npec.normalized.model";
import { zRncp, zRncpCode } from "../../../zod/certifications.primitives";
import { zParisLocalDateParam } from "../../../zod/date.primitives";
import { IRoutesDef } from "../../common.routes";

const zSimulateurContext = z.object({
  rncps: z.array(z.object({ intitule: z.string(), code: zRncpCode })),
  conventions_collectives: z.array(z.object({ idcc: z.number(), titre: z.string() })),
});

export const zSimulateurRoutes = {
  get: {
    "/_private/simulateur/context": {
      method: "get",
      path: "/_private/simulateur/context",
      response: {
        200: zSimulateurContext,
      },
      securityScheme: null,
    },
    "/_private/simulateur/npec/contrat": {
      method: "get",
      path: "/_private/simulateur/npec/contrat",
      querystring: z.object({
        rncp: zRncp,
        idcc: z.coerce.number(),
        date_signature: zParisLocalDateParam,
      }),
      response: {
        200: z
          .object({
            npec: zSourceNpecNormalizedData,
            metadata: z.object({
              title: z.string(),
              description: z.string(),
              resource: z.string().url(),
            }),
          })
          .nullable(),
      },
      securityScheme: null,
    },
  },
} as const satisfies IRoutesDef;