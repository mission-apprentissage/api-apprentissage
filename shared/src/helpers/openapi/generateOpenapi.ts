import type { ResponseConfig, RouteConfig } from "@asteasolutions/zod-to-openapi";
import { OpenApiGeneratorV31, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { formatParamUrl } from "@fastify/swagger";
import { zCertification } from "api-alternance-sdk";
import { zodOpenApi } from "api-alternance-sdk/internal";
import type { SecurityRequirementObject } from "openapi3-ts/oas30";
import type { ZodType } from "zod";

import { zRoutes } from "../../index.js";
import type { IRouteSchema } from "../../routes/common.routes.js";
import {
  zResBadGateway,
  zResBadRequest,
  zResForbidden,
  zResInternalServerError,
  zResNotFound,
  zResServiceUnavailable,
  zResTooManyRequest,
  zResUnauthorized,
} from "../../routes/common.routes.js";

function getZodDescription(schema: ZodType): string {
  return schema._def.openapi?.metadata?.description ?? schema.description ?? "";
}

function generateOpenApiResponseObject(main: ZodType, alternative: ZodType | null = null): ResponseConfig {
  return {
    description: getZodDescription(main),
    content: {
      "application/json": {
        schema: alternative === null ? main : zodOpenApi.union([main, alternative]),
      },
    },
  };
}

const errorResponses: { [statusCode: string]: [string, ZodType] } = {
  400: ["BadRequest", zResBadRequest],
  401: ["Unauthorized", zResUnauthorized],
  403: ["Forbidden", zResForbidden],
  404: ["NotFound", zResNotFound],
  429: ["TooManyRequests", zResTooManyRequest],
  500: ["InternalServerError", zResInternalServerError],
  502: ["BadGateway", zResBadGateway],
  503: ["ServiceUnavailable", zResServiceUnavailable],
};

const models: Record<string, ZodType> = {
  Certification: zCertification,
};

function generateOpenApiResponsesObject<R extends IRouteSchema["response"]>(
  response: R
): { [statusCode: string]: ResponseConfig } {
  const codes = new Set([...Object.keys(response), ...Object.keys(errorResponses)]);

  return Array.from(codes).reduce<Record<string, ResponseConfig>>((acc, code) => {
    if (code in response) {
      const r: ZodType = response[code as `${1 | 2 | 3 | 4 | 5}${string}`];

      acc[code] = generateOpenApiResponseObject(r, errorResponses[code]?.[1] ?? null);
    } else if (code in errorResponses) {
      acc[code] = generateOpenApiResponseObject(errorResponses[code][1]);
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

  if (route.securityScheme.auth !== "api-key") {
    throw new Error("getSecurityRequirementObject: securityScheme not supported");
  }

  return [{ "api-key": [] }];
}

function addOpenApiOperation(
  path: string,
  method: "get" | "put" | "post" | "delete",
  route: IRouteSchema,
  registry: OpenAPIRegistry
) {
  if (!route.openapi) {
    return;
  }

  registry.registerPath({
    ...route.openapi,
    method,
    path: formatParamUrl(path),
    request: generateOpenApiRequest(route),
    responses: generateOpenApiResponsesObject(route.response),
    security: getSecurityRequirementObject(route),
  });
}

function registerModel(registry: OpenAPIRegistry) {
  Object.entries(models).forEach(([id, zod]) => {
    registry.register(id, zod);
  });

  Object.entries(errorResponses).forEach(([_statusCode, [id, zod]]) => {
    registry.register(id, zod);
  });
}

export function generateOpenApiSchema(version: string, env: string, publicUrl: string) {
  const registry = new OpenAPIRegistry();

  registry.registerComponent("securitySchemes", "api-key", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "Bearer",
    description: "Clé d'API à fournir dans le header `Authorization`.",
  });

  registerModel(registry);

  for (const [method, pathRoutes] of Object.entries(zRoutes)) {
    for (const [path, route] of Object.entries(pathRoutes)) {
      addOpenApiOperation(path, method as "get" | "put" | "post" | "delete", route, registry);
    }
  }

  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
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
    openapi: "3.1.0",
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
      { name: "Certifications", description: "Liste des opérations sur les certifications." },
      {
        name: "Expérimental",
        description: "Liste des routes expérimentales. Attention: ces routes peuvent changer sans préavis.",
      },
    ],
  });
}
