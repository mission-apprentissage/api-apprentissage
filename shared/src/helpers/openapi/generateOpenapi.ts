import type { ResponseConfig, RouteConfig } from "@asteasolutions/zod-to-openapi";
import { OpenApiGeneratorV31, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { formatParamUrl } from "@fastify/swagger";
import {
  registerOpenApiCertificationSchema,
  registerOpenApiErrorsSchema,
  registerOpenApiJobModel,
} from "api-alternance-sdk/internal";
import type { PathsObject, SecurityRequirementObject } from "openapi3-ts/oas31";
import { OpenApiBuilder } from "openapi3-ts/oas31";

import { registerCertificationRoutes } from "../../routes/certification.routes.js";
import type { IRouteSchema, IRoutesDef } from "../../routes/common.routes.js";
import { zSourceAcceRoutes } from "../../routes/experimental/source/acce.routes.js";
import { registerHealhcheckRoutes } from "../../routes/healthcheck.routes.js";
import { registerJobRoutes } from "../../routes/job.routes.js";
import { registerOrganismeRoutes } from "../../routes/organisme.routes.js";

function generateOpenApiResponsesObject<R extends IRouteSchema["response"]>(
  response: R
): Record<string, ResponseConfig> {
  return Object.entries(response).reduce<Record<string, ResponseConfig>>((acc, [code, main]) => {
    if (code in response) {
      acc[code] = {
        description: main.description ?? "",
        content: {
          "application/json": {
            schema: main,
          },
        },
      };
    }

    return acc;
  }, {});
}

function generateOpenApiRequest(route: IRouteSchema): RouteConfig["request"] {
  const requestParams: RouteConfig["request"] = {};

  if (route.method !== "get" && route.body) {
    requestParams.body = {
      content: {
        "application/json": { schema: route.body },
      },
      required: true,
    };
  }
  if (route.params) {
    requestParams.params = route.params;
  }
  if (route.querystring) {
    requestParams.query = route.querystring;
  }
  if (route.headers) {
    requestParams.headers = route.headers;
  }

  return requestParams;
}

function getSecurityRequirementObject(route: IRouteSchema): SecurityRequirementObject[] {
  if (route.securityScheme === null) {
    return [];
  }

  return [{ [route.securityScheme.auth]: [] }];
}

function experimentalGenerateOpenApiPathItem(route: IRouteSchema, registry: OpenAPIRegistry) {
  try {
    registry.registerPath({
      tags: ["Expérimental"],
      method: route.method,
      path: formatParamUrl(route.path),
      request: generateOpenApiRequest(route),
      responses: generateOpenApiResponsesObject(route.response),
      security: getSecurityRequirementObject(route),
    });
  } catch (e) {
    const message = `Error while generating OpenAPI for route ${route.method.toUpperCase()} ${route.path}`;
    console.error(message, e);
    throw new Error(message, { cause: e });
  }
}

export function experimentalGenerateOpenApiPathsObject(routes: IRoutesDef): PathsObject {
  const registry = new OpenAPIRegistry();

  for (const [, pathRoutes] of Object.entries(routes)) {
    for (const [path, route] of Object.entries(pathRoutes)) {
      if (!path.startsWith("/_private")) {
        experimentalGenerateOpenApiPathItem(route, registry);
      }
    }
  }

  const openApiGenerator = new OpenApiGeneratorV31(registry.definitions);
  const { paths } = openApiGenerator.generateDocument({
    openapi: "3",
    info: {
      title: "Documentation technique de l'API Apprentissage",
      version: "1.0.0",
    },
  });

  if (paths == null) {
    throw new Error("No schemas found in the generated components");
  }

  return paths;
}

export function generateOpenApiSchema(version: string, env: string, publicUrl: string) {
  const builder = new OpenApiBuilder({
    openapi: "3.1.0",
    info: {
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
    },
    servers: [
      {
        url: publicUrl,
        description: env,
      },
    ],
    tags: [
      {
        name: "Essayer l'API",
        description: "Pour essayer l'API [vous pouvez utiliser le swagger UI](/documentation-technique/try)",
      },
      {
        name: "Certifications",
        description: "Liste des opérations sur les certifications.",
      },
      {
        name: "Job",
        description: "Apprenticeship job opportunities",
      },
      {
        name: "Expérimental",
        description: "Liste des routes expérimentales. Attention: ces routes peuvent changer sans préavis.",
      },
    ],
    paths: experimentalGenerateOpenApiPathsObject(zSourceAcceRoutes),
  });

  builder.addSecurityScheme("api-key", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "Bearer",
    description: "Clé d'API à fournir dans le header `Authorization`.",
  });

  registerOpenApiCertificationSchema(builder);
  registerOpenApiJobModel(builder);
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
  } as const;

  registerHealhcheckRoutes(builder, errorResponses);
  registerCertificationRoutes(builder, errorResponses);
  registerJobRoutes(builder, errorResponses);
  registerOrganismeRoutes(builder, errorResponses);

  return builder.getSpec();
}
