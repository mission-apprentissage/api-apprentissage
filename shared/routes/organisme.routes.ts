import { zOrganisme, zSiret, zUai } from "api-alternance-sdk";
import { z } from "zod";

import { zodOpenApi } from "../zod/zodWithOpenApi";
import { IRoutesDef } from "./common.routes";

const zRechercheOrganismeResultat = zodOpenApi.object({
  status: zodOpenApi.object({
    ouvert: zodOpenApi.boolean(),
    declaration_catalogue: zodOpenApi.boolean(),
    validation_uai: zodOpenApi.boolean(),
  }),
  correspondances: zodOpenApi.object({
    uai: zodOpenApi
      .object({
        lui_meme: zodOpenApi.boolean(),
        son_lieu: zodOpenApi.boolean(),
        // Following cannot be checked with referentiel only
        // We need to check through catalogue
        // son_formateur: zodOpenApi.boolean(),
        // son_responsable: zodOpenApi.boolean(),
        // lieu_de_son_responsable: zodOpenApi.boolean(),
        // lieu_de_son_formateur: zodOpenApi.boolean(),
      })
      .nullable(),
    siret: zodOpenApi
      .object({
        son_formateur: zodOpenApi.boolean(),
        son_responsable: zodOpenApi.boolean(),
        lui_meme: zodOpenApi.boolean(),
      })
      .nullable(),
  }),
  organisme: zOrganisme,
});

const zRechercheOrganismeResponse = zodOpenApi.object({
  metadata: zodOpenApi.object({
    uai: zodOpenApi
      .object({
        status: zodOpenApi.enum(["inconnu", "ok"]),
      })
      .nullable(),
    siret: zodOpenApi
      .object({
        status: zodOpenApi.enum(["inconnu", "fermé", "ok"]),
      })
      .nullable(),
  }),
  resultat: zRechercheOrganismeResultat.nullable(),
  candidats: zodOpenApi.array(zRechercheOrganismeResultat),
});

export type IRechercheOrganismeResultat = zodOpenApi.output<typeof zRechercheOrganismeResultat>;

export type IRechercheOrganismeResponse = zodOpenApi.output<typeof zRechercheOrganismeResponse>;

export const zOrganismesRoutes = {
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
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
      openapi: {
        tags: ["Organismes"] as string[],
        summary: "Recherche d'organismes par UAI et/ou SIRET",
        description: "Récupère la liste des organismes, filtrée par UAI et/ou SIRET fournis",
        operationId: "searchOrganismes",
      },
    },
  },
} as const satisfies IRoutesDef;
