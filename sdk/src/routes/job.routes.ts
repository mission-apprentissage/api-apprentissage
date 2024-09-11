import { z } from "zod";

import { zRncpCode } from "../models/index.js";
import { zJobOffer, zJobRecruiter } from "../models/job/job.model.js";
import { zLatitudeCoerce, zLongitudeCoerce, zOfferTargetDiplomaLevel } from "../models/job/job.primitives.js";
import type { IApiRoutesDef } from "./common.routes.js";

export const zJobSearchQuery = z.object({
  longitude: zLongitudeCoerce.optional(),
  latitude: zLatitudeCoerce.optional(),
  radius: z.coerce.number().min(0).max(200).default(30).optional(),
  target_diploma_level: zOfferTargetDiplomaLevel.optional(),
  romes: z.string().optional(),
  rncp: zRncpCode.optional(),
});

export type IJobSearchQuery = z.output<typeof zJobSearchQuery>;

export const zJobSearchResponse = z.object({
  jobs: zJobOffer.array(),
  recruiters: zJobRecruiter.array(),
  warnings: z.array(z.object({ message: z.string(), code: z.string() })),
});

export type IJobSearchResponse = z.output<typeof zJobSearchResponse>;

export const zApiJobRoutes = {
  get: {
    "/job/v1/search": {
      method: "get",
      path: "/job/v1/search",
      querystring: zJobSearchQuery,
      response: {
        "200": zJobSearchResponse,
      },
      openapi: {
        tags: ["Job"] as string[],
        summary: "Opportunités d’emploi en alternance",
        description:
          "Accédez en temps réel à l'ensemble des opportunités d'emploi en alternance disponibles sur le territoire français et exposez les gratuitement et en marque blanche auprès de vos utilisateurs.",
        operationId: "searchJobs",
      },
    },
  },
} as const satisfies IApiRoutesDef;
