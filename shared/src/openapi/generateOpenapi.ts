import type { ResponseConfig, RouteConfig } from "@asteasolutions/zod-to-openapi";
import { OpenApiGeneratorV31, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { formatParamUrl } from "@fastify/swagger";
import {
  addOperationDoc,
  addSchemaModelDoc,
  getTextOpenAPI,
  openapiSpec,
  registerOpenApiErrorsSchema,
} from "api-alternance-sdk/internal";
import type { PathItemObject, PathsObject, SecurityRequirementObject } from "openapi3-ts/oas31";
import { OpenApiBuilder } from "openapi3-ts/oas31";
import type { AnyZodObject } from "zod";

import type { IRouteSchema, IRoutesDef } from "../routes/common.routes.js";
import { zSourceAcceRoutes } from "../routes/experimental/source/acce.routes.js";
import { registerHealhcheckRoutes } from "../routes/healthcheck.routes.js";

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
  if (route.querystring && route.querystring._def.typeName !== "ZodUnknown") {
    requestParams.query = route.querystring as AnyZodObject;
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

  const habiliations: string[] = [];

  if (route.securityScheme.access) {
    habiliations.push(route.securityScheme.access);
  }

  return [{ [route.securityScheme.auth]: habiliations }];
}

function experimentalGenerateOpenApiPathItem(route: IRouteSchema, registry: OpenAPIRegistry, tag: string) {
  try {
    registry.registerPath({
      tags: [tag],
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

export function experimentalGenerateOpenApiPathsObject(routes: IRoutesDef, tag: string): PathsObject {
  const registry = new OpenAPIRegistry();

  for (const [, pathRoutes] of Object.entries(routes)) {
    for (const [path, route] of Object.entries(pathRoutes)) {
      if (!path.startsWith("/_private")) {
        experimentalGenerateOpenApiPathItem(route, registry, tag);
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

export function generateOpenApiSchema(version: string, env: string, publicUrl: string, lang: "en" | "fr") {
  const builder = new OpenApiBuilder({
    openapi: "3.1.0",
    info: {
      title:
        lang === "fr" ? "Documentation technique de l'API Apprentissage" : "API Apprentissage technical documentation",
      version,
      license: {
        name: "Etalab-2.0",
        url: "https://github.com/etalab/licence-ouverte/blob/master/LO.md",
      },
      termsOfService: "https://api.apprentissage.beta.gouv.fr/cgu",
      contact: {
        name: lang === "fr" ? "Équipe API Apprentissage" : "API Apprentissage team",
        email: "support_api@apprentissage.beta.gouv.fr",
      },
    },
    servers: [
      {
        url: publicUrl,
        description: env,
      },
    ],
    tags: Object.values(openapiSpec.tags).map(({ name, description }) => ({
      name: getTextOpenAPI(name, lang),
      description: getTextOpenAPI(description, lang),
    })),
    paths: experimentalGenerateOpenApiPathsObject(
      zSourceAcceRoutes,
      getTextOpenAPI(openapiSpec.tags.exprimental.name, lang)
    ),
  });

  builder.addSecurityScheme("api-key", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "Bearer",
    description:
      lang === "fr"
        ? "Clé d'API à fournir dans le header `Authorization`. Si la route nécessite une habiliation particulière veuillez contacter le support pour en faire la demande à [support_api@apprentissage.beta.gouv.fr](mailto:support_api@apprentissage.beta.gouv.fr)"
        : "API key to provide in the `Authorization` header. If the route requires a particular authorization, please contact support to request it at [support_api@apprentissage.beta.gouv.fr](mailto:support_api@apprentissage.beta.gouv.fr)",
  });

  for (const [name, s] of Object.entries(openapiSpec.models)) {
    builder.addSchema(name, addSchemaModelDoc(s.schema, s.doc, lang));
  }

  for (const [path, operations] of Object.entries(openapiSpec.routes)) {
    builder.addPath(
      path,
      Object.entries(operations).reduce<PathItemObject>((acc, [method, operation]) => {
        acc[method as "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace"] = addOperationDoc(
          operation,
          lang
        );
        return acc;
      }, {})
    );
  }

  registerOpenApiErrorsSchema(builder, lang);
  registerHealhcheckRoutes(builder, lang);

  return builder.getSpec();
}
