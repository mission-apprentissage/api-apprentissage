import { registerOpenApiCertificationSchema, registerOpenApiErrorsSchema } from "api-alternance-sdk/internal";
import { OpenApiBuilder } from "openapi3-ts/oas31";

import { registerCertificationRoutes } from "../../routes/certification.routes.js";
import { registerAcceExperimentalRoutes } from "../../routes/experimental/source/acce.routes.openapi.js";
import { registerHealhcheckRoutes } from "../../routes/healthcheck.routes.js";
import { registerJobRoutes } from "../../routes/job.routes.js";
import { registerOrganismeRoutes } from "../../routes/organisme.routes.js";

export function generateOpenApiSchema(version: string, env: string, publicUrl: string) {
  const builder = new OpenApiBuilder();

  builder
    .addInfo({
      title: "Documentation technique de l'API Apprentissage",
      version,
      license: {
        name: "Etalab-2.0",
        url: "https://github.com/etalab/licence-ouverte/blob/master/LO.md",
      },
      termsOfService: "https://api.apprentissage.beta.gouv.fr/cgu",
      contact: {
        name: "Équipe API Apprentissage",
        email: "support_api@apprentissage.beta.gouv.fr",
      },
    })
    .addServer({
      url: publicUrl,
      description: env,
    })
    .addTag({
      name: "Essayer l'API",
      description: "Pour essayer l'API [vous pouvez utiliser le swagger UI](/documentation-technique/try)",
    })
    .addTag({
      name: "Certifications",
      description: "Liste des opérations sur les certifications.",
    })
    .addTag({
      name: "Expérimental",
      description: "Liste des routes expérimentales. Attention: ces routes peuvent changer sans préavis.",
    })
    .addSecurityScheme("api-key", {
      type: "http",
      scheme: "bearer",
      bearerFormat: "Bearer",
      description: "Clé d'API à fournir dans le header `Authorization`.",
    });

  registerOpenApiCertificationSchema(builder);
  registerOpenApiErrorsSchema(builder);

  const errorResponses = {
    "400": {
      description: "Paramètre de requête non valide.",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/BadRequest",
          },
        },
      },
    },
    "401": {
      description: "Clé d’API manquante ou invalide",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Unauthorized",
          },
        },
      },
    },
    "403": {
      description: "Habilitations insuffisantes pour accéder à la ressource",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Forbidden",
          },
        },
      },
    },
    "404": {
      description: "Resource non trouvée",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/NotFound",
          },
        },
      },
      "409": {
        description: "Conflit",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Conflict",
            },
          },
        },
      },
      "429": {
        description: "Limite de volumétrie atteinte pour la clé d’API",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TooManyRequests",
            },
          },
        },
      },
      "500": {
        description: "Une erreur inattendue s'est produite sur le serveur.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/InternalServerError",
            },
          },
        },
      },
      "502": {
        description: "Le service est indisponible.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/BadGateway",
            },
          },
        },
        "503": {
          description: "Le service est en maintenance",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ServiceUnavailable",
              },
            },
          },
        },
      },
    },
  } as const;

  registerHealhcheckRoutes(builder, errorResponses);
  registerCertificationRoutes(builder, errorResponses);
  registerAcceExperimentalRoutes(builder, errorResponses);
  registerJobRoutes(builder, errorResponses);
  registerOrganismeRoutes(builder, errorResponses);

  return builder.getSpec();
}
