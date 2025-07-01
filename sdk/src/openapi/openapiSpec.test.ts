import type { ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
import { describe, expect, it } from "vitest";
import type { DocRoute, DocTechnicalField } from "../docs/types.js";
import { buildOpenApiSchema } from "./builder/openapi.builder.js";
import { openapiSpec } from "./openapiSpec.js";
import type { OpenapiRoute } from "./types.js";
import { getOpenapiOperations } from "./utils/openapi.uils.js";

function getDocTechnicalFieldListStructure(docs: DocTechnicalField[], prefix: string = ""): string[] {
  const structure: string[] = [prefix];

  for (let i = 0; i < docs.length; i++) {
    structure.push(...getDocTechnicalFieldStructure(docs[i], `${prefix}.[${i}]`));
  }

  return structure;
}

function getDocTechnicalFieldStructure(doc: DocTechnicalField, prefix: string = ""): string[] {
  const structure: string[] = [prefix];

  if (doc.allOf) {
    structure.push(...getDocTechnicalFieldListStructure(doc.allOf, `${prefix}.allOf`));
  }
  if (doc.oneOf) {
    structure.push(...getDocTechnicalFieldListStructure(doc.oneOf, `${prefix}.oneOf`));
  }
  if (doc.anyOf) {
    structure.push(...getDocTechnicalFieldListStructure(doc.anyOf, `${prefix}.anyOf`));
  }
  if (doc.not) {
    structure.push(...getDocTechnicalFieldStructure(doc.not, `${prefix}.not`));
  }
  if (doc.items) {
    structure.push(...getDocTechnicalFieldStructure(doc.items, `${prefix}.items`));
  }
  if (doc.additionalProperties) {
    structure.push(...getDocTechnicalFieldStructure(doc.additionalProperties, `${prefix}.additionalProperties`));
  }
  if (doc.propertyNames) {
    structure.push(...getDocTechnicalFieldStructure(doc.propertyNames, `${prefix}.propertyNames`));
  }
  if (doc.prefixItems) {
    structure.push(...getDocTechnicalFieldListStructure(doc.prefixItems, `${prefix}.prefixItems`));
  }
  if (doc.properties) {
    structure.push(`${prefix}.properties`);
    for (const key in doc.properties) {
      if (doc.properties[key]) {
        structure.push(...getDocTechnicalFieldStructure(doc.properties[key], `${prefix}.properties.${key}`));
      }
    }
  }

  return structure.toSorted();
}

function getSchemaObjectListDocStructure(schemas: (SchemaObject | ReferenceObject)[], prefix: string = ""): string[] {
  const structure: string[] = [prefix];

  for (let i = 0; i < schemas.length; i++) {
    structure.push(...getSchemaObjectDocStructure(schemas[i], `${prefix}.[${i}]`));
  }

  return structure;
}

function getSchemaObjectDocStructure(
  schema: SchemaObject | ReferenceObject | undefined,
  prefix: string = ""
): string[] {
  const structure: string[] = [prefix];

  if (!schema || "$ref" in schema) {
    return structure;
  }

  if (schema.properties) {
    structure.push(`${prefix}.properties`);
    for (const key in schema.properties) {
      if (schema.properties[key]) {
        structure.push(...getSchemaObjectDocStructure(schema.properties[key], `${prefix}.properties.${key}`));
      }
    }
  }

  if (schema.items) {
    structure.push(...getSchemaObjectDocStructure(schema.items, `${prefix}.items`));
  }
  if (schema.allOf) {
    structure.push(...getSchemaObjectListDocStructure(schema.allOf, `${prefix}.allOf`));
  }
  if (schema.oneOf) {
    structure.push(...getSchemaObjectListDocStructure(schema.oneOf, `${prefix}.oneOf`));
  }
  if (schema.anyOf) {
    structure.push(...getSchemaObjectListDocStructure(schema.anyOf, `${prefix}.anyOf`));
  }
  if (schema.not) {
    structure.push(...getSchemaObjectDocStructure(schema.not, `${prefix}.not`));
  }
  if (schema.additionalProperties && schema.additionalProperties !== true) {
    structure.push(...getSchemaObjectDocStructure(schema.additionalProperties, `${prefix}.additionalProperties`));
  }
  if (schema.propertyNames) {
    structure.push(...getSchemaObjectDocStructure(schema.propertyNames, `${prefix}.propertyNames`));
  }
  if (schema.prefixItems) {
    structure.push(...getSchemaObjectListDocStructure(schema.prefixItems, `${prefix}.prefixItems`));
  }

  return structure.toSorted();
}

function getDocRouteStructure(route: DocRoute | null, prefix: string = ""): string[] {
  const structure: string[] = [prefix];

  if (route === null) {
    return structure;
  }

  if (route.parameters) {
    for (const [key, parameter] of Object.entries(route.parameters)) {
      structure.push(...getDocTechnicalFieldStructure(parameter, `${prefix}.parameters.${key}`));
    }
  }

  if (route.body) {
    if (route.body.content) {
      structure.push(...getDocTechnicalFieldStructure(route.body.content, `${prefix}.body`));
    } else {
      structure.push(`${prefix}.body`);
    }
  }

  if (route.response) {
    if (route.response.content) {
      structure.push(...getDocTechnicalFieldStructure(route.response.content, `${prefix}.response`));
    } else {
      structure.push(`${prefix}.response`);
    }
  }

  return structure.toSorted();
}

function getContentObjectDocStructure(content: SchemaObject, prefix: string = ""): string[] {
  const structure: string[] = [];

  for (const [_key, mediaType] of Object.entries(content)) {
    structure.push(...getSchemaObjectDocStructure(mediaType.schema, prefix));
  }

  return structure;
}

function getOperationObjectDocStructure(schema: OpenapiRoute["schema"], prefix: string = ""): string[] {
  const structure: string[] = [prefix];

  if (schema.parameters) {
    for (const parameter of schema.parameters) {
      if (!("$ref" in parameter)) {
        structure.push(`${prefix}.parameters.${parameter.name}`);
      }
    }
  }

  if (schema.requestBody) {
    if (!("$ref" in schema.requestBody)) {
      structure.push(...getContentObjectDocStructure(schema.requestBody.content, `${prefix}.body`));
    }
  }

  if (schema.responses) {
    for (const [key, response] of Object.entries(schema.responses)) {
      if (key === "default" || key.startsWith("2")) {
        if (response.content) {
          structure.push(...getContentObjectDocStructure(response.content, `${prefix}.response`));
        } else {
          structure.push(`${prefix}.response`);
        }
      }
    }
  }

  return structure.toSorted();
}

describe("openapiSpec#models", () => {
  it.each(Object.entries(openapiSpec.models))("should have doc in sync with schema %s", (_modelName, model) => {
    if (model.doc === null) {
      return;
    }
    expect(getDocTechnicalFieldStructure(model.doc)).toEqual(getSchemaObjectDocStructure(model.schema));
  });

  it.each(Object.entries(openapiSpec.models))("should generate proper schema %s", (_modelName, model) => {
    expect(model.schema).toMatchSnapshot();
  });
});

describe("openapiSpec#routes", () => {
  describe.each(Object.entries(openapiSpec.routes))("route %s", (_routeName, route) => {
    it.each(Object.entries(route))("should have doc in sync with schema %s", (_key, operation) => {
      if (operation?.doc == null) {
        return;
      }
      expect(getDocRouteStructure(operation.doc)).toEqual(getOperationObjectDocStructure(operation.schema));
    });
  });

  it("should generate schema in sync with zod definition", async () => {
    const builder = buildOpenApiSchema("0.0.0", "test", "https://api-test.apprentissage.beta.houv.fr", null);
    const doc = builder.getSpec();

    if (doc.openapi !== "3.1.0") {
      throw new Error("Unsupported OpenAPI version");
    }

    const resultOperations = getOpenapiOperations(doc.paths);
    expect(resultOperations).toMatchSnapshot();
  });
});
