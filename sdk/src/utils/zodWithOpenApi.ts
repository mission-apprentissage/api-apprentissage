import { extendZodWithOpenApi as extendZodWithOpenApiBase } from "@asteasolutions/zod-to-openapi";
import type { ContentObject, OperationObject, ParameterObject, ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
import { z } from "zod";

import type { DocBusinessField, DocModel, DocRoute, DocTechnicalField, OpenApiText } from "../internal.js";
import { addErrorResponseOpenApi } from "../models/errors/errors.model.openapi.js";

function extendZodWithOpenApi<T extends typeof z>(zod: T): T {
  extendZodWithOpenApiBase(zod);

  return zod;
}

const zodOpenApi = extendZodWithOpenApi(z);

function getTextOpenAPI<T extends OpenApiText | null | undefined>(
  value: T,
  lang: "fr" | "en"
): T extends null | undefined ? null : string {
  if (value == null) {
    return null as T extends null | undefined ? null : string;
  }

  if (value[lang]) {
    return value[lang] as T extends null | undefined ? null : string;
  }

  const text = Object.values(value).find((v) => v !== null);

  if (!text) {
    throw new Error("No text value found in " + JSON.stringify(value));
  }

  return text as T extends null | undefined ? null : string;
}

function getDocOpenAPIAttributes(
  field: DocTechnicalField | DocBusinessField,
  lang: "en" | "fr"
): {
  description?: string;
  examples?: unknown[];
} {
  const description: string[] = [];

  if (field.description) {
    description.push(getTextOpenAPI(field.description, lang));
  }

  if ("information" in field && field.information) {
    description.push(getTextOpenAPI(field.information, lang));
  }

  if (field.notes) {
    description.push("Notes:");
    description.push(getTextOpenAPI(field.notes, lang));
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

function addSchemaModelDoc<T extends SchemaObject | ReferenceObject | undefined>(
  schema: T,
  doc: DocModel,
  lang: "en" | "fr"
): T {
  if (!schema || "$ref" in schema) {
    return schema;
  }

  const fields = Object.entries(doc.sections).reduce<Record<string, DocTechnicalField>>((acc, [_name, field]) => {
    return { ...acc, ...field._ };
  }, {});

  return addSchemaDoc(schema, { description: doc.description, _: fields }, lang);
}

function addSchemaDoc<T extends SchemaObject | ReferenceObject | undefined>(
  schema: T,
  doc: DocTechnicalField,
  lang: "en" | "fr"
): T {
  if (!schema || "$ref" in schema) {
    return schema;
  }

  const output: SchemaObject = { ...schema, ...getDocOpenAPIAttributes(doc, lang) };

  const docProperties = doc._;

  if (output.properties && docProperties) {
    output.properties = Object.entries(output.properties).reduce(
      (acc, [prop, propSchema]) => {
        if (prop in docProperties) {
          acc[prop] = addSchemaDoc(propSchema, docProperties[prop], lang);
        } else {
          acc[prop] = propSchema;
        }

        return acc;
      },
      {} as Record<string, SchemaObject | ReferenceObject>
    );
  }

  if (output.items && docProperties) {
    output.items = addSchemaDoc(output.items, docProperties["[]"], lang);
  }

  if (output.prefixItems && docProperties) {
    output.prefixItems = output.prefixItems.map((item, index): SchemaObject | ReferenceObject => {
      if (index in docProperties) {
        return addSchemaDoc(item, docProperties[index], lang);
      }
      return item;
    });
  }

  return output as T;
}

function addContentObjectDoc<T extends ContentObject | undefined>(
  content: T,
  doc: DocTechnicalField | undefined,
  lang: "en" | "fr"
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
      schema: addSchemaDoc(media.schema, doc, lang),
    };

    return acc;
  }, {} as ContentObject);
}

function addOperationDoc(operation: OperationObject, doc: DocRoute, lang: "en" | "fr"): OperationObject {
  const output = structuredClone(operation);

  output.summary = getTextOpenAPI(doc.summary, lang);
  output.description = getTextOpenAPI(doc.description, lang);

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
        schema: addSchemaDoc(param.schema, docParams[param.name], lang),
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
          description: getTextOpenAPI(docResponse.description, lang),
          content: addContentObjectDoc(response.content, docResponse.content, lang),
        };

        return acc;
      },
      {} as Record<string, SchemaObject>
    );
  }

  return addErrorResponseOpenApi(output);
}

export {
  addSchemaModelDoc,
  addOperationDoc,
  zodOpenApi,
  getDocOpenAPIAttributes,
  pickPropertiesOpenAPI,
  getTextOpenAPI,
};
