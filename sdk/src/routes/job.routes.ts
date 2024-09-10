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
        tags: ["Organismes"] as string[],
        summary: "Recherche d'organismes par UAI et/ou SIRET",
        description: "Récupère la liste des organismes, filtrée par UAI et/ou SIRET fournis",
        operationId: "searchOrganismes",
      },
    },
  },
} as const satisfies IApiRoutesDef;
