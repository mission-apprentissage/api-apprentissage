import { randomUUID } from "crypto";
import type { SecurityRequirementObject } from "openapi3-ts/oas30";
import type {
  OperationObject,
  ParameterObject,
  PathsObject,
  ReferenceObject,
  ResponsesObject,
  SchemaObject,
  SchemasObject,
} from "openapi3-ts/oas31";
import { getPath } from "openapi3-ts/oas31";

import { safeParse, toJSONSchema } from "zod/v4-mini";
import type { $ZodRegistry, $ZodType, JSONSchema } from "zod/v4/core";
import type { IApiRouteSchema } from "../../routes/common.routes.js";

export type OpenapiOperation = {
  id: string;
  method: "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace";
  operation: OperationObject;
  path: string;
};

type RegistryMeta = { id?: string | undefined; openapi?: Partial<SchemaObject> };

function isOperationMethod(method: string): method is OpenapiOperation["method"] {
  return ["get", "post", "put", "delete", "patch", "head", "options", "trace"].includes(method);
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

function getZodSchema(
  zod: $ZodType,
  registry: $ZodRegistry<RegistryMeta>,
  io: "input" | "output"
): SchemaObject | ReferenceObject {
  const meta = registry.get(zod) ?? null;

  if (meta?.id != null) {
    return { $ref: meta.id as string };
  }

  const id = randomUUID();
  registry.add(zod, { id, ...meta });

  const components = generateComponents(registry, io);

  // TODO: cache
  if (meta == null) {
    registry.remove(zod);
  } else {
    registry.add(zod, meta);
  }

  return components.schemas[id] as SchemaObject;
}

function generateOpenApiResponsesObject<R extends IApiRouteSchema["response"]>(
  response: R,
  registry: $ZodRegistry<RegistryMeta>
): ResponsesObject | null {
  const result = Object.entries(response).reduce<ResponsesObject>((acc, [code, main]) => {
    if (main._zod.def.type === "unknown") {
      return acc;
    }

    if (code in response) {
      acc[code] = {
        description: "",
        content: {
          "application/json": {
            schema: getZodSchema(main, registry, "output"),
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

function isRequiredZod(schema: $ZodType): boolean {
  switch (schema._zod.def.type) {
    case "object":
    case "union":
    case "int":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "record":
    case "file":
    case "array":
    case "tuple":
    case "intersection":
    case "map":
    case "set":
    case "enum":
    case "literal":
    case "nullable":
    case "nonoptional":
    case "success":
    case "transform":
    case "catch":
    case "nan":
    case "readonly":
    case "template_literal":
    case "promise":
    case "lazy":
    case "custom":
    case "pipe":
      throw new Error(
        `Unexpected Zod type "${schema._zod.def.type}" in isRequiredZod. This is unsupported at the moment.`
      );
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "symbol":
    case "date":
      return true;
    case "undefined":
    case "optional":
    case "default":
    case "prefault":
      return false;
  }
}

function isEmptyValueAllowedZod(zod: $ZodType): true | undefined {
  return safeParse(zod, "").success ? true : undefined;
}

function generateOpenApiRequest(
  route: IApiRouteSchema,
  registry: $ZodRegistry<RegistryMeta>
): Pick<OperationObject, "requestBody" | "parameters"> {
  const requestParams: Pick<OperationObject, "requestBody" | "parameters"> = {};
  const parameters: ParameterObject[] = [];

  if (route.method !== "get" && route.body) {
    requestParams.requestBody = {
      content: {
        "application/json": { schema: getZodSchema(route.body, registry, "input") },
      },
      required: true,
    };
  }

  if (route.params) {
    Object.entries(route.params._zod.def.shape).forEach(([name, schema]) => {
      const param: ParameterObject = {
        name: String(name),
        in: "path",
        required: isRequiredZod(schema),
        schema: getZodSchema(schema, registry, "input"),
      };
      if (isEmptyValueAllowedZod(schema)) {
        param.allowEmptyValue = true;
      }
      parameters.push(param);
    });
  }

  const qsZod = route.querystring;
  if (qsZod && qsZod._zod.def.type !== "unknown") {
    switch (qsZod._zod.def.type) {
      case "object":
        Object.entries(qsZod._zod.def.shape).forEach(([name, schema]) => {
          const param: ParameterObject = {
            name: String(name),
            in: "query",
            required: isRequiredZod(schema),
            schema: getZodSchema(schema, registry, "input"),
          };
          if (isEmptyValueAllowedZod(schema)) {
            param.allowEmptyValue = true;
          }
          parameters.push(param);
        });
        break;
      case "pipe":
        Object.entries(qsZod._zod.def.in._zod.def.shape).forEach(([name, schema]) => {
          const param: ParameterObject = {
            name: String(name),
            in: "query",
            required: isRequiredZod(schema),
            schema: getZodSchema(schema, registry, "input"),
          };
          parameters.push(param);
        });
        break;
    }
  }

  if (route.headers) {
    Object.entries(route.headers._zod.def.shape).forEach(([name, schema]) => {
      const param: ParameterObject = {
        name: String(name),
        in: "header",
        required: isRequiredZod(schema),
        schema: getZodSchema(schema, registry, "input"),
      };
      parameters.push(param);
    });
  }

  if (parameters.length > 0) {
    requestParams.parameters = parameters;
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

export function generateOpenApiOperationObjectFromZod(
  route: IApiRouteSchema | undefined,
  registry: $ZodRegistry<RegistryMeta>,
  path: string,
  method: string,
  tag: string
): OperationObject {
  try {
    if (!route) {
      throw new Error(`Invalid route or method: ${method} ${path}`);
    }

    const responses = generateOpenApiResponsesObject(route.response, registry);

    if (!responses) {
      throw new Error(`No response defined for route ${route.method.toUpperCase()} ${route.path}`);
    }

    return {
      tags: [tag],
      operationId: `${method}${path.replaceAll(/[^\w\s]/gi, "_")}`,
      ...generateOpenApiRequest(route, registry),
      responses: {
        ...responses,
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
        "409": { $ref: "#/components/responses/Conflict" },
        "419": { $ref: "#/components/responses/TooManyRequests" },
        "500": { $ref: "#/components/responses/InternalServerError" },
        "502": { $ref: "#/components/responses/BadGateway" },
        "503": { $ref: "#/components/responses/ServiceUnavailable" },
      },
      security: getSecurityRequirementObject(route),
    };
  } catch (e) {
    const message = `Error while generating OpenAPI for route ${method.toUpperCase()} ${path}`;
    console.error(message, e);
    throw new Error(message, { cause: e });
  }
}

export function generateComponents(
  registry: $ZodRegistry<RegistryMeta>,
  io: "input" | "output"
): { schemas: Record<string, SchemasObject> } {
  const { schemas } = toJSONSchema(registry, {
    unrepresentable: "any",
    uri: (id: string) => id,
    io,
    override: (ctx: { zodSchema: $ZodType; jsonSchema: JSONSchema.BaseSchema }): void => {
      const meta = registry.get(ctx.zodSchema);
      if (meta?.openapi) {
        Object.assign(ctx.jsonSchema, meta?.openapi);
      }

      if ("maximum" in ctx.jsonSchema && ctx.jsonSchema.maximum === Number.MAX_SAFE_INTEGER) {
        delete ctx.jsonSchema.maximum;
      }

      if ("minimum" in ctx.jsonSchema && ctx.jsonSchema.minimum === Number.MIN_SAFE_INTEGER) {
        delete ctx.jsonSchema.minimum;
      }
    },
  });
  Object.keys(schemas).forEach((key) => {
    const schema = schemas[key];
    if ("$id" in schema) delete schema.$id; // OpenAPI does not use $id
    if ("$schema" in schema) delete schema.$schema; // OpenAPI does not use $schema
  });
  return { schemas } as { schemas: Record<string, SchemasObject> };
}
