import { z } from "zod/v4-mini";

import { zOrganisme } from "../../models/organisme/organisme.model.js";
import { zSiret, zUai } from "../../models/organisme/organismes.primitives.js";
import { zPaginationInfo, zPaginationQuery } from "../../models/pagination/pagination.model.js";
import type { IApiRoutesDef } from "../common.routes.js";

const zRechercheOrganismeResultat = z.object({
  status: z.object({
    ouvert: z.boolean(),
    declaration_catalogue: z.boolean(),
    validation_uai: z.boolean(),
  }),
  correspondances: z.object({
    uai: z.nullable(
      z.object({
        lui_meme: z.boolean(),
        son_lieu: z.boolean(),
        // Following cannot be checked with referentiel only
        // We need to check through catalogue
        // son_formateur: z.boolean(),
        // son_responsable: z.boolean(),
        // lieu_de_son_responsable: z.boolean(),
        // lieu_de_son_formateur: z.boolean(),
      })
    ),
    siret: z.nullable(
      z.object({
        son_formateur: z.boolean(),
        son_responsable: z.boolean(),
        lui_meme: z.boolean(),
      })
    ),
  }),
  organisme: z.pick(zOrganisme, { identifiant: true }),
});

export const zRechercheOrganismeResponse = z.object({
  metadata: z.object({
    uai: z.nullable(
      z.object({
        status: z.enum(["inconnu", "ok"]),
      })
    ),
    siret: z.nullable(
      z.object({
        status: z.enum(["inconnu", "fermé", "ok"]),
      })
    ),
  }),
  resultat: z.nullable(zRechercheOrganismeResultat),
  candidats: z.array(zRechercheOrganismeResultat),
});

export type IRechercheOrganismeResultat = z.output<typeof zRechercheOrganismeResultat>;

export type IRechercheOrganismeResponse = z.output<typeof zRechercheOrganismeResponse>;

export const zApiOrganismesRoutes = {
  get: {
    "/organisme/v1/recherche": {
      method: "get",
      path: "/organisme/v1/recherche",
      querystring: z.object({
        uai: z._default(z.nullable(zUai), null),
        siret: z._default(z.nullable(zSiret), null),
      }),
      response: {
        "200": zRechercheOrganismeResponse,
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
    "/organisme/v1/export": {
      method: "get",
      path: "/organisme/v1/export",
      querystring: zPaginationQuery,
      response: {
        "200": z.object({
          data: z.array(zOrganisme),
          pagination: zPaginationInfo,
        }),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;
