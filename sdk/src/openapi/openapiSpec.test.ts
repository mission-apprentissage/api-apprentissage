import type { ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
import { describe, expect, it } from "vitest";
import { ZodUnknown } from "zod";

import type { DocModel, DocRoute, DocTechnicalField } from "../docs/types.js";
import { zApiRoutes } from "../routes/index.js";
import { buildOpenApiSchema } from "./builder/openapi.builder.js";
import { compareOperationObjectsStructure, compareSchemaObjectsStructure } from "./compare/compareOpenapiSchema.js";
import type { StructureDiff } from "./internal.js";
import { openapiSpec } from "./openapiSpec.js";
import type { OpenapiRoute } from "./types.js";
import {
  generateOpenApiComponentSchemasFromZod,
  generateOpenApiPathsObjectFromZod,
  getOpenapiOperations,
} from "./utils/openapi.uils.js";

function getDocTechnicalFieldStructure(doc: DocTechnicalField, prefix: string = ""): string[] {
  const structure: string[] = [prefix];

  if (!doc._) {
    return structure;
  }

  for (const key in doc._) {
    if (doc._[key]) {
      structure.push(...getDocTechnicalFieldStructure(doc._[key], `${prefix}.${key}`));
    }
  }

  return structure;
}

function getDocModelStructure(doc: DocModel, prefix: string = ""): string[] {
  const structure: string[] = [prefix];

  if (!doc._) {
    return structure;
  }

  for (const key in doc._) {
    if (doc._[key]) {
      structure.push(...getDocTechnicalFieldStructure(doc._[key], `${prefix}.${key}`));
    }
  }

  return structure.toSorted();
}

function getSchemaObjectStructure(schema: SchemaObject | ReferenceObject | undefined, prefix: string = ""): string[] {
  const structure: string[] = [prefix];

  if (!schema || "$ref" in schema) {
    return structure;
  }

  if (schema.properties) {
    for (const key in schema.properties) {
      if (schema.properties[key]) {
        structure.push(...getSchemaObjectStructure(schema.properties[key], `${prefix}.${key}`));
      }
    }
  }

  if (schema.items) {
    structure.push(...getSchemaObjectStructure(schema.items, `${prefix}.[]`));
  }

  if (schema.prefixItems) {
    for (const key in schema.prefixItems) {
      if (schema.prefixItems[key]) {
        structure.push(...getSchemaObjectStructure(schema.prefixItems[key], `${prefix}.${key}`));
      }
    }
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

function getContentObjectStructure(content: SchemaObject, prefix: string = ""): string[] {
  const structure: string[] = [];

  for (const [_key, mediaType] of Object.entries(content)) {
    structure.push(...getSchemaObjectStructure(mediaType.schema, prefix));
  }

  return structure;
}

function getOperationObjectStructure(schema: OpenapiRoute["schema"], prefix: string = ""): string[] {
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
      structure.push(...getContentObjectStructure(schema.requestBody.content, `${prefix}.body`));
    }
  }

  if (schema.responses) {
    for (const [key, response] of Object.entries(schema.responses)) {
      if (key === "default" || key.startsWith("2")) {
        if (response.content) {
          structure.push(...getContentObjectStructure(response.content, `${prefix}.response`));
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
    expect(getDocModelStructure(model.doc)).toEqual(getSchemaObjectStructure(model.schema));
  });

  it.each(Object.entries(openapiSpec.models))(
    "should zod model defined with zodOpenapi for %s",
    (_modelName, model) => {
      if (model.zod === null) {
        return;
      }

      expect(model.zod._def.openapi?._internal?.refId).toEqual(model.name);
    }
  );

  it("should generate schema in sync with zod definition", async () => {
    const builder = buildOpenApiSchema("0.0.0", "test", "https://api-test.apprentissage.beta.houv.fr", "fr");
    const doc = builder.getSpec();

    if (doc.openapi !== "3.1.0") {
      throw new Error("Unsupported OpenAPI version");
    }

    const zodSchema = generateOpenApiComponentSchemasFromZod(openapiSpec.models);

    const diff = Object.entries(openapiSpec.models).reduce<Record<string, StructureDiff<"zod", "api">>>(
      (acc, [name, model]) => {
        if (model.zod instanceof ZodUnknown) {
          return acc;
        }

        const zodModel = zodSchema[name] as SchemaObject;
        const d = compareSchemaObjectsStructure({ name: "zod", s: zodModel }, { name: "api", s: model.schema });

        if (d !== null) {
          acc[name] = d;
        }

        return acc;
      },
      {}
    );

    expect(diff).toMatchSnapshot();
  });
});

describe("openapiSpec#routes", () => {
  describe.each(Object.entries(openapiSpec.routes))("route %s", (_routeName, route) => {
    it.each(Object.entries(route))("should have doc in sync with schema %s", (_key, operation) => {
      if (operation.doc === null) {
        return;
      }
      expect(getDocRouteStructure(operation.doc)).toEqual(getOperationObjectStructure(operation.schema));
    });
  });

  it("should generate schema in sync with zod definition", async () => {
    const builder = buildOpenApiSchema("0.0.0", "test", "https://api-test.apprentissage.beta.houv.fr", "fr");
    const doc = builder.getSpec();

    if (doc.openapi !== "3.1.0") {
      throw new Error("Unsupported OpenAPI version");
    }

    const resultOperations = getOpenapiOperations(doc.paths);
    const zodOperations = getOpenapiOperations(generateOpenApiPathsObjectFromZod(zApiRoutes, "test"));

    const operationIds = Object.entries(openapiSpec.routes).flatMap(([path, route]) => {
      return Object.keys(route).map((method) => `${method}:${path}`);
    });

    const diff = Object.keys(zodOperations).reduce<Record<string, StructureDiff<"zod", "api">>>((acc, id) => {
      if (!operationIds.includes(id)) {
        return acc;
      }

      const d = compareOperationObjectsStructure(
        { name: "zod", op: zodOperations[id]?.operation },
        { name: "api", op: resultOperations[id]?.operation }
      );

      if (d !== null) {
        acc[id] = d;
      }

      return acc;
    }, {});

    expect(diff).toMatchSnapshot();
  });
});
