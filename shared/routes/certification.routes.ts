import { z } from "zod";

import { zPublicCertification } from "../models/certification.model";
import { zCfdParam, zRncpParam } from "../zod/certifications.primitives";
import { IRoutesDef } from "./common.routes";

export const zCertificationsRoutes = {
  get: {
    "/certification/v1": {
      method: "get",
      path: "/certification/v1",
      querystring: z.object({
        "identifiant.cfd": zCfdParam.optional().openapi({
          examples: ["46X32402", "", "null"],
          param: {
            description: [
              "Filtre la liste des certifications par `identifiant.cfd`",
              "- Si la valeur est vide ou `null`, filtre avec `identifiant.cfd = null`",
              "- Si la valeur est absente, aucun filtre n'est appliqué",
              "- Sinon doit respecter le regex `/^[A-Z0-9]{3}\\d{3}[A-Z0-9]{2}$/`",
            ].join("\n\n"),
            allowEmptyValue: true,
          },
        }),
        "identifiant.rncp": zRncpParam.optional().openapi({
          examples: ["RNCP12345", "", "null"],
          param: {
            description: [
              "Filtre la liste des certifications par `identifiant.rncp`",
              "- Si la valeur est vide ou `null`, filtre avec `identifiant.rncp = null`",
              "- Si la valeur est absente, aucun filtre n'est appliqué",
              "- Sinon doit respecter le regex `/^RNCP\\d{3,5}$/`",
            ].join("\n\n"),
            allowEmptyValue: true,
          },
        }),
      }),
      response: {
        "200": z.array(zPublicCertification).openapi({
          description: "Liste des certifications",
        }),
      },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
      openapi: {
        tags: ["Certifications"] as string[],
        summary: "Récupération des certifications",
        description: "Récupère la liste des certifications, filtrée par `identifiant.cfd` et `identifiant.rncp`",
        operationId: "getCertifications",
      },
    },
  },
} as const satisfies IRoutesDef;
