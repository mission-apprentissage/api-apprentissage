import OpenAPIParser from "@readme/openapi-parser";
import diff from "microdiff";
import type {
  ContentObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
} from "openapi3-ts/oas31";
import { describe, expect, it } from "vitest";

import { zRoutes } from "../../routes/index.js";
import { experimentalGenerateOpenApiPathsObject, generateOpenApiSchema } from "./generateOpenapi.js";

function cleanSchemaObject(schema: SchemaObject | ReferenceObject | undefined): unknown {
  if (!schema) {
    return;
  }

  if ("$ref" in schema) {
    return {
      $ref: schema.$ref,
    };
  }

  return {
    discriminator: schema.discriminator,
    type: schema.type,
    format: schema.format,
    allOf: cleanSchemaObjectList(schema.allOf),
    oneOf: cleanSchemaObjectList(schema.oneOf),
    anyOf: cleanSchemaObjectList(schema.anyOf),
    not: cleanSchemaObject(schema.not),
    items: cleanSchemaObject(schema.items),
    properties: cleanSchemaObjectRecord(schema.properties),
    additionalProperties: schema.additionalProperties,
    propertyNames: schema.propertyNames,
    default: schema.default,
    multipleOf: schema.multipleOf,
    maximum: schema.maximum,
    const: schema.const,
    exclusiveMaximum: schema.exclusiveMaximum,
    minimum: schema.minimum,
    exclusiveMinimum: schema.exclusiveMinimum,
    maxLength: schema.maxLength,
    minLength: schema.minLength,
    pattern: schema.pattern,
    maxItems: schema.maxItems,
    minItems: schema.minItems,
    uniqueItems: schema.uniqueItems,
    maxProperties: schema.maxProperties,
    minProperties: schema.minProperties,
    required: schema.required?.toSorted(),
    enum: schema.enum,
    prefixItems: cleanSchemaObjectList(schema.prefixItems),
    contentMediaType: schema.contentMediaType,
    contentEncoding: schema.contentEncoding,
  };
}

function cleanSchemaObjectList(schema: (SchemaObject | ReferenceObject)[] | undefined) {
  if (!schema) {
    return;
  }

  return schema.map((s) => cleanSchemaObject(s));
}

function cleanSchemaObjectRecord(schema: Record<string, SchemaObject | ReferenceObject> | undefined) {
  if (!schema) {
    return;
  }

  return Object.fromEntries(Object.entries(schema).map(([k, s]) => [k, cleanSchemaObject(s)]));
}

function cleanContentObject(c: ContentObject | undefined) {
  if (!c) {
    return;
  }

  return Object.fromEntries(
    Object.entries(c).map(([k, v]) => [
      k,
      {
        schema: cleanSchemaObject(v.schema),
        encoding: v.encoding,
      },
    ])
  );
}

function cleanParameters(parameters: (ParameterObject | ReferenceObject)[] | undefined) {
  if (!parameters) {
    return;
  }

  return parameters.map((p) => {
    if ("$ref" in p) {
      return {
        $ref: p.$ref,
      };
    }

    return {
      name: p.name,
      in: p.in,
      required: p.required,
      allowEmptyValue: p.allowEmptyValue,
      schema: cleanSchemaObject(p.schema),
      content: cleanContentObject(p.content),
    };
  });
}

function cleanRequestBodyObject(requestBody: RequestBodyObject | ReferenceObject | undefined) {
  if (!requestBody) {
    return;
  }
  if ("$ref" in requestBody) {
    return {
      $ref: requestBody.$ref,
    };
  }

  return {
    description: requestBody.description,
    content: cleanContentObject(requestBody.content),
    required: requestBody.required,
  };
}

function cleanResponseObject(response: ResponseObject | ReferenceObject) {
  if ("$ref" in response) {
    return {
      $ref: response.$ref,
    };
  }

  return {
    headers: response.headers,
    content: cleanContentObject(response.content),
  };
}

function cleanResponsesObject(responses: ResponsesObject | undefined) {
  if (!responses) {
    return;
  }

  return Object.fromEntries(
    Object.entries(responses)
      .filter(([k]) => k.startsWith("2"))
      .map(([k, v]) => [k, cleanResponseObject(v)])
  );
}

function cleanOperationObject(operation: OperationObject | undefined) {
  if (!operation) {
    return;
  }

  return {
    parameters: cleanParameters(operation.parameters),
    requestBody: cleanRequestBodyObject(operation.requestBody),
    responses: cleanResponsesObject(operation.responses),
    security: operation.security,
  };
}

function cleanPathItemObject(pathItem: PathItemObject | undefined) {
  if (!pathItem) {
    return {};
  }

  return JSON.parse(
    JSON.stringify({
      get: cleanOperationObject(pathItem.get),
      put: cleanOperationObject(pathItem.put),
      post: cleanOperationObject(pathItem.post),
      delete: cleanOperationObject(pathItem.delete),
      options: cleanOperationObject(pathItem.options),
      head: cleanOperationObject(pathItem.head),
      patch: cleanOperationObject(pathItem.patch),
    })
  );
}

describe("generateOpenApiSchema", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openapi: any = generateOpenApiSchema("V1.0", "Production", "https://api.apprentissage.beta.gouv.fr");

  it("should generate proper schema", async () => {
    expect(openapi).toMatchSnapshot();
  });

  it("should be valid OpenAPI schema", async () => {
    const validationResult = await OpenAPIParser.validate(openapi)
      .then(() => ({ success: true, error: null }))
      .catch((e) => ({ success: false, error: e }));

    expect.soft(validationResult.success).toBe(true);
    expect(validationResult.error).toBe(null);
  });

  const expectedPaths = experimentalGenerateOpenApiPathsObject(zRoutes);

  it.each<[string]>(Object.keys(openapi.paths).map((p) => [p]))("should be alright %s", async (path) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolvedOpenapi: OpenAPIObject = (await OpenAPIParser.dereference(openapi)) as any;
    expect(
      diff(cleanPathItemObject(resolvedOpenapi.paths?.[path]), cleanPathItemObject(expectedPaths[path]))
    ).toMatchSnapshot();
  });
});
