import { extendZodWithOpenApi as extendZodWithOpenApiBase } from "@asteasolutions/zod-to-openapi";
import type { ContentObject, OperationObject, ParameterObject, ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
import { z } from "zod";

import type { DocBusinessField, DocRoute, DocTechnicalField } from "../internal.js";

function extendZodWithOpenApi<T extends typeof z>(zod: T): T {
  extendZodWithOpenApiBase(zod);

  return zod;
}

const zodOpenApi = extendZodWithOpenApi(z);

function buildOpenApiDescriptionLegacy(description: string | string[], notes: string[] = []): string {
  const d = Array.isArray(description) ? description : [description];
  if (notes.length > 0) {
    d.push("Notes:");
    d.push(...notes);
  }

  return d.join("\n\n");
}

function getDocOpenAPIAttributes(field: DocTechnicalField | DocBusinessField): {
  description?: string;
  examples?: unknown[];
} {
  const description: string[] = [];

  if (field.description) {
    description.push(field.description);
  }

  if ("information" in field && field.information) {
    description.push(field.information);
  }

  if (field.notes) {
    description.push("Notes:");
    description.push(field.notes);
  }

  const r: { description?: string; examples?: unknown[] } = {};

  if (description.length > 0) {
    r.description = description.join("\n\n");
  }

  if (field.examples) {
    r.examples = [...field.examples] as unknown[];
  }

  return r;
}

function pickPropertiesOpenAPI<T extends Record<string, SchemaObject>, K extends keyof T>(
  source: T,
  props: K[]
): Record<K, SchemaObject> {
  return props.reduce(
    (acc, prop) => {
      acc[prop] = source[prop];

      return acc;
    },
    {} as Record<K, SchemaObject>
  );
}

function addSchemaDoc<T extends SchemaObject | ReferenceObject | undefined>(schema: T, doc: DocTechnicalField): T {
  if (!schema || "$ref" in schema) {
    return schema;
  }

  const output: SchemaObject = { ...schema, ...getDocOpenAPIAttributes(doc) };

  const docProperties = doc._;
  if (output.properties && docProperties) {
    output.properties = Object.entries(output.properties).reduce(
      (acc, [prop, propSchema]) => {
        if (prop in docProperties) {
          acc[prop] = addSchemaDoc(propSchema, docProperties[prop]);
        } else {
          acc[prop] = propSchema;
        }

        return acc;
      },
      {} as Record<string, SchemaObject | ReferenceObject>
    );
  }

  return output as T;
}

function addContentObjectDoc<T extends ContentObject | undefined>(
  content: T,
  doc: DocTechnicalField | undefined
): ContentObject | undefined {
  if (!content || !doc) {
    return content;
  }

  return Object.entries(content).reduce((acc, [mediaType, media]) => {
    if (mediaType !== "application/json") {
      acc[mediaType] = media;
      return acc;
    }

    acc[mediaType] = {
      ...media,
      schema: addSchemaDoc(media.schema, doc),
    };

    return acc;
  }, {} as ContentObject);
}

function addOperationDoc(operation: OperationObject, doc: DocRoute): OperationObject {
  const output = structuredClone(operation);

  output.summary = doc.summary;
  output.description = doc.description;

  if (doc.parameters) {
    if (!output.parameters) {
      throw new Error("Operation parameters are not defined for " + operation.operationId);
    }

    const docParams = doc.parameters;

    output.parameters = output.parameters.map((param): ReferenceObject | ParameterObject => {
      if ("$ref" in param) {
        return param;
      }

      if (!docParams[param.name]) {
        return param;
      }

      return {
        ...param,
        schema: addSchemaDoc(param.schema, docParams[param.name]),
      };
    });
  }

  if (doc.response) {
    if (!output.responses) {
      throw new Error("Operation responses are not defined for " + operation.operationId);
    }

    const docResponse = doc.response;

    output.responses = Object.entries(output.responses).reduce(
      (acc, [code, response]) => {
        if (!code.startsWith("2")) {
          acc[code] = response;
          return acc;
        }

        acc[code] = {
          ...response,
          description: docResponse.description,
          content: addContentObjectDoc(response.content, docResponse.content),
        };

        return acc;
      },
      {} as Record<string, SchemaObject>
    );
  }

  return output;
}

export { addOperationDoc, zodOpenApi, buildOpenApiDescriptionLegacy, getDocOpenAPIAttributes, pickPropertiesOpenAPI };
