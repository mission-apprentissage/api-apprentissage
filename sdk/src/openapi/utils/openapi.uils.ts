import type { ResponseConfig, RouteConfig } from "@asteasolutions/zod-to-openapi";
import { OpenApiGeneratorV31, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { formatParamUrl } from "@fastify/swagger";
import OpenAPIParser from "@readme/openapi-parser";
import type { SecurityRequirementObject } from "openapi3-ts/oas30";
import type { OpenAPIObject, OperationObject, PathsObject, ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
import { getPath } from "openapi3-ts/oas31";
import type { AnyZodObject } from "zod";
import { ZodUnknown } from "zod";

import type { IApiRouteSchema, IApiRoutesDef } from "../../routes/common.routes.js";
import type { OpenapiModel } from "../types.js";

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

export function getOperationObjectId({ method, path }: { method: string; path: string }): string {
  return `${method}:${path}`;
}

export function getOpenapiOperations(paths: PathsObject | undefined): Record<string, OpenapiOperation> {
  if (paths == null) return {};

  return Object.fromEntries(
    Object.keys(paths)
      .flatMap((path) => {
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
      })
      .map((o) => [o.id, o])
  );
}

function generateOpenApiResponsesObject<R extends IApiRouteSchema["response"]>(
  response: R
): Record<string, ResponseConfig> | null {
  const result = Object.entries(response).reduce<Record<string, ResponseConfig>>((acc, [code, main]) => {
    if (main instanceof ZodUnknown) {
      return acc;
    }

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

  if (Object.keys(result).length === 0) {
    return null;
  }

  return result;
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
    const responses = generateOpenApiResponsesObject(route.response);
    if (responses) {
      registry.registerPath({
        tags: [tag],
        method: route.method,
        path: formatParamUrl(route.path),
        request: generateOpenApiRequest(route),
        responses,
        security: getSecurityRequirementObject(route),
      });
    }
  } catch (e) {
    const message = `Error while generating OpenAPI for route ${route.method.toUpperCase()} ${route.path}`;
    console.error(message, e);
    throw new Error(message, { cause: e });
  }
}

export function generateOpenApiDocFromZod(
  routes: IApiRoutesDef,
  models: Record<string, OpenapiModel>,
  tag: string
): OpenAPIObject {
  const registry = new OpenAPIRegistry();

  for (const [, model] of Object.entries(models)) {
    if (model.zod !== null) {
      registry.register(model.name, model.zod);
    }
  }

  for (const [, pathRoutes] of Object.entries(routes)) {
    for (const [path, route] of Object.entries(pathRoutes)) {
      if (!path.startsWith("/_private")) {
        generateOpenApiPathItemFromZod(route, registry, tag);
      }
    }
  }

  const openApiGenerator = new OpenApiGeneratorV31(registry.definitions);
  return openApiGenerator.generateDocument({
    openapi: "3",
    info: {
      title: "Documentation technique de l'API Apprentissage",
      version: "1.0.0",
    },
  });
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
  const doc = openApiGenerator.generateDocument({
    openapi: "3",
    info: {
      title: "Documentation technique de l'API Apprentissage",
      version: "1.0.0",
    },
  });

  if (doc.paths == null) {
    throw new Error("No schemas found in the generated components");
  }

  return doc.paths;
}

export function generateOpenApiComponentSchemasFromZod(
  models: Record<string, OpenapiModel>
): Record<string, SchemaObject | ReferenceObject> {
  const registry = new OpenAPIRegistry();

  for (const [, model] of Object.entries(models)) {
    if (model.zod !== null) {
      registry.register(model.name, model.zod);
    }
  }

  const openApiGenerator = new OpenApiGeneratorV31(registry.definitions);
  const doc = openApiGenerator.generateDocument({
    openapi: "3",
    info: {
      title: "Documentation technique de l'API Apprentissage",
      version: "1.0.0",
    },
  });

  if (doc.components == null) {
    throw new Error("No schemas found in the generated components");
  }

  return doc.components.schemas ?? {};
}
