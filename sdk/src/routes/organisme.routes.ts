import { z } from "zod";

import { zOrganisme, zSiret, zUai } from "../models/index.js";
import { IApiRoutesDef } from "./common.routes.js";

const zRechercheOrganismeResultat = z.object({
  status: z.object({
    ouvert: z.boolean(),
    declaration_catalogue: z.boolean(),
    validation_uai: z.boolean(),
  }),
  correspondances: z.object({
    uai: z
      .object({
        lui_meme: z.boolean(),
        son_lieu: z.boolean(),
        // Following cannot be checked with referentiel only
        // We need to check through catalogue
        // son_formateur: z.boolean(),
        // son_responsable: z.boolean(),
        // lieu_de_son_responsable: z.boolean(),
        // lieu_de_son_formateur: z.boolean(),
      })
      .nullable(),
    siret: z
      .object({
        son_formateur: z.boolean(),
        son_responsable: z.boolean(),
        lui_meme: z.boolean(),
      })
      .nullable(),
  }),
  organisme: zOrganisme,
});

export const zRechercheOrganismeResponse = z.object({
  metadata: z.object({
    uai: z
      .object({
        status: z.enum(["inconnu", "ok"]),
      })
      .nullable(),
    siret: z
      .object({
        status: z.enum(["inconnu", "fermé", "ok"]),
      })
      .nullable(),
  }),
  resultat: zRechercheOrganismeResultat.nullable(),
  candidats: z.array(zRechercheOrganismeResultat),
});

export type IRechercheOrganismeResultat = z.output<typeof zRechercheOrganismeResultat>;

export type IRechercheOrganismeResponse = z.output<typeof zRechercheOrganismeResponse>;

export const zApiOrganismesRoutes = {
  get: {
    "/organismes/v1/recherche": {
      method: "get",
      path: "/organismes/v1/recherche",
      querystring: z.object({
        uai: zUai.nullable().default(null),
        siret: zSiret.nullable().default(null),
      }),
      response: {
        "200": zRechercheOrganismeResponse,
      },
    },
  },
} as const satisfies IApiRoutesDef;
