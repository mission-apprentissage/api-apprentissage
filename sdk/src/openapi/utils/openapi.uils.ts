import type { ResponseConfig, RouteConfig } from "@asteasolutions/zod-to-openapi";
import { OpenApiGeneratorV31, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { formatParamUrl } from "@fastify/swagger";
import OpenAPIParser from "@readme/openapi-parser";
import type { SecurityRequirementObject } from "openapi3-ts/oas30";
import type { OpenAPIObject, OperationObject, PathsObject } from "openapi3-ts/oas31";
import { getPath } from "openapi3-ts/oas31";
import type { AnyZodObject } from "zod";

import type { IApiRouteSchema, IApiRoutesDef } from "../../routes/common.routes.js";

export async function dereferenceOpenapiSchema(data: OpenAPIObject): Promise<OpenAPIObject> {
  if (data.openapi !== "3.1.0") {
    throw new Error("Unsupported OpenAPI version");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await OpenAPIParser.dereference(data as any)) as any;
}

export type OpenapiOperation = {
  id: string;
  method: "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace";
  operation: OperationObject;
  path: string;
};

function isOperationMethod(method: string): method is OpenapiOperation["method"] {
  return ["get", "post", "put", "delete", "patch", "head", "options", "trace"].includes(method);
}

export function getOpeanipOperations(paths: PathsObject | undefined): OpenapiOperation[] {
  if (paths == null) return [];

  return Object.keys(paths).flatMap((path) => {
    const pathItem = getPath(paths, path);

    if (!pathItem) {
      throw new Error("unexpected: PathItem not found");
    }

    return Object.keys(pathItem)
      .map((method): OpenapiOperation | null => {
        if (!isOperationMethod(method)) {
          return null;
        }

        const operation = pathItem[method];
        if (!operation) {
          return null;
        }

        return { id: `${method}:${path}`, method: method, operation, path };
      })
      .filter((operation): operation is OpenapiOperation => operation !== null)
      .toSorted((a, b) => a.id.localeCompare(b.id));
  });
}

function generateOpenApiResponsesObject<R extends IApiRouteSchema["response"]>(
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

function generateOpenApiRequest(route: IApiRouteSchema): RouteConfig["request"] {
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

function getSecurityRequirementObject(route: IApiRouteSchema): SecurityRequirementObject[] {
  if (route.securityScheme === null) {
    return [];
  }

  const habiliations: string[] = [];

  if (route.securityScheme.access) {
    habiliations.push(route.securityScheme.access);
  }

  return [{ [route.securityScheme.auth]: habiliations }];
}

function generateOpenApiPathItemFromZod(route: IApiRouteSchema, registry: OpenAPIRegistry, tag: string) {
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

export function generateOpenApiPathsObjectFromZod(routes: IApiRoutesDef, tag: string): PathsObject {
  const registry = new OpenAPIRegistry();

  for (const [, pathRoutes] of Object.entries(routes)) {
    for (const [path, route] of Object.entries(pathRoutes)) {
      if (!path.startsWith("/_private")) {
        generateOpenApiPathItemFromZod(route, registry, tag);
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
