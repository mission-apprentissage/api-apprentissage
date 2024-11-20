import { z } from "zod";

import type { IApiRoutesDef } from "../common.routes.js";

export const zApiJobRoutes = {
  get: {
    "/job/v1/search": {
      method: "get",
      path: "/job/v1/search",
      querystring: z.unknown(),
      response: {
        "200": z.unknown(),
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
  post: {
    "/job/v1/offer": {
      method: "post",
      path: "/job/v1/offer",
      body: z.unknown(),
      response: {
        "200": z.unknown(),
      },
      openapi: {
        tags: ["Job"] as string[],
        summary: "Publier une offre d'emploi en alternance",
        description: "Publiez une offre d'emploi en alternance",
        operationId: "createJobOffer",
      },
    },
  },
  put: {
    "/job/v1/offer/:id": {
      method: "put",
      path: "/job/v1/offer/:id",
      params: z.object({ id: z.string() }),
      body: z.unknown(),
      response: {
        "204": z.unknown(),
      },
      openapi: {
        tags: ["Job"] as string[],
        summary: "Modification d'une offre d'emploi en alternance",
        description: "Modifiez une offre d'emploi en alternance",
        operationId: "updateJobOffer",
      },
    },
  },
} as const satisfies IApiRoutesDef;
