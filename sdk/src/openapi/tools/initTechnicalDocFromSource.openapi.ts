import type {
  ContentObject,
  OperationObject,
  ParameterObject,
  ReferenceObject,
  ResponsesObject,
  SchemaObject,
} from "openapi3-ts/oas31";

import type { DocRoute, DocTechnicalField } from "../../docs/types.js";

export function initRouteTechnicalDocFromSource(
  operation: OperationObject,
  sourceLang: "en" | "fr"
): { operation: OperationObject; doc: DocRoute } {
  const {
    tags: _tags,
    security: _security,
    summary,
    description,
    parameters,
    requestBody,
    responses,
    ...rest
  } = operation;

  const result: { operation: OperationObject; doc: DocRoute } = {
    operation: rest,
    doc: {
      summary: { en: "", fr: "" },
      description: { en: "", fr: "" },
      response: {
        description: { en: "", fr: "" },
      },
    },
  };

  if (summary) {
    result.doc.summary[sourceLang] = summary;
  }
  if (description) {
    result.doc.description[sourceLang] = description;
  }

  if (parameters) {
    const docParams: Record<string, DocTechnicalField> = {};
    const outParams: Array<ParameterObject | ReferenceObject> = [];
    result.doc.parameters = docParams;
    result.operation.parameters = outParams;

    for (const parameter of parameters) {
      if ("$ref" in parameter) {
        outParams.push(parameter);
        continue;
      }

      const { schema, ...rest } = parameter;

      outParams.push(rest);

      if (schema) {
        const { schema: schemaSchema, doc: schemaDoc } = initModelTechnicalDocFromSource(schema, sourceLang);
        docParams[parameter.name] = schemaDoc;
        outParams.push({
          ...rest,
          schema: schemaSchema,
        });
      }
    }
  }

  if (requestBody) {
    if ("$ref" in requestBody) {
      result.operation.requestBody = requestBody;
    } else {
      const { description = "", content, ...rest } = requestBody;

      const contentResult = initContentObjectTechnicalDoc(content, sourceLang);

      result.operation.requestBody = {
        ...rest,
        content: contentResult.content,
      };

      result.doc.body = {
        description: { en: "", fr: "", [sourceLang]: description },
        content: contentResult.doc,
      };
    }
  }

  if (responses) {
    const outResponses: ResponsesObject = {};
    result.operation.responses = outResponses;

    for (const [code, response] of Object.entries(responses)) {
      if ("$ref" in response) {
        outResponses[code] = response;
        continue;
      }

      if (code !== "default" && !code.startsWith("2")) {
        outResponses[code] = response;
        continue;
      }

      const { description, content, ...rest } = response;
      result.doc.response.description[sourceLang] = description;

      const contentResult = initContentObjectTechnicalDoc(content, sourceLang);

      outResponses[code] = {
        ...rest,
        content: contentResult.content,
      };
      result.doc.response.content = contentResult.doc;
    }
  }

  return result;
}

function initContentObjectTechnicalDoc(
  source: ContentObject,
  sourceLang: "en" | "fr"
): { content: ContentObject; doc: DocTechnicalField | undefined } {
  const result: { content: ContentObject; doc: DocTechnicalField | undefined } = {
    content: {},
    doc: undefined,
  };

  for (const [mediaType, media] of Object.entries(source)) {
    if (mediaType !== "application/json") {
      result.content[mediaType] = media;
      continue;
    }

    const { schema, ...rest } = media;

    result.content[mediaType] = rest;

    if (schema) {
      const { schema: schemaSchema, doc: schemaDoc } = initModelTechnicalDocFromSource(schema, sourceLang);
      result.content[mediaType].schema = schemaSchema;
      result.doc = schemaDoc;
    }
  }

  return result;
}

export function initModelTechnicalDocFromSource(
  source: SchemaObject | ReferenceObject,
  sourceLang: "en" | "fr"
): { schema: SchemaObject | ReferenceObject; doc: DocTechnicalField } {
  const result: { schema: SchemaObject | ReferenceObject; doc: DocTechnicalField } = {
    schema: {},
    doc: {
      descriptions: null,
    },
  };

  if (source.description) {
    result.doc.descriptions = [{ en: "", fr: "", [sourceLang]: source.description }];
  }

  if ("$ref" in source) {
    result.schema = source;

    return result;
  }

  const {
    description,
    allOf,
    oneOf,
    anyOf,
    not,
    items,
    properties,
    additionalProperties,
    propertyNames,
    prefixItems,
    examples,
    example,
    ...rest
  } = source;

  result.schema = rest;

  if (properties) {
    const outProperties: Record<string, SchemaObject | ReferenceObject> = {};
    const props: DocTechnicalField["properties"] = {};
    result.schema.properties = outProperties;
    result.doc.properties = props;
    for (const key in properties) {
      const { schema, doc } = initModelTechnicalDocFromSource(properties[key], sourceLang);
      outProperties[key] = schema;
      props[key] = doc;
    }
  }

  if (items) {
    const { schema, doc } = initModelTechnicalDocFromSource(items, sourceLang);
    result.schema.items = schema;
    result.doc.items = doc;
  }
  if (allOf) {
    const { schema, doc } = initModelTechnicalDocList(allOf, sourceLang);
    result.schema.allOf = schema;
    result.doc.allOf = doc;
  }
  if (oneOf) {
    const { schema, doc } = initModelTechnicalDocList(oneOf, sourceLang);
    result.schema.oneOf = schema;
    result.doc.oneOf = doc;
  }
  if (anyOf) {
    const { schema, doc } = initModelTechnicalDocList(anyOf, sourceLang);
    result.schema.anyOf = schema;
    result.doc.anyOf = doc;
  }
  if (not) {
    const { schema, doc } = initModelTechnicalDocFromSource(not, sourceLang);
    result.schema.not = schema;
    result.doc.not = doc;
  }
  if (additionalProperties != null) {
    if (typeof additionalProperties === "boolean") {
      result.schema.additionalProperties = additionalProperties;
    } else {
      const { schema, doc } = initModelTechnicalDocFromSource(additionalProperties, sourceLang);
      result.schema.additionalProperties = schema;
      result.doc.additionalProperties = doc;
    }
  }
  if (propertyNames) {
    const { schema, doc } = initModelTechnicalDocFromSource(propertyNames, sourceLang);
    result.schema.propertyNames = schema;
    result.doc.propertyNames = doc;
  }
  if (prefixItems) {
    const { schema, doc } = initModelTechnicalDocList(prefixItems, sourceLang);
    result.schema.prefixItems = schema;
    result.doc.prefixItems = doc;
  }

  if (examples) {
    result.doc.examples = examples;
  } else if (example) {
    result.doc.examples = [example];
  }

  return result;
}

function initModelTechnicalDocList(
  source: Array<SchemaObject | ReferenceObject>,
  sourceLang: "en" | "fr"
): { schema: Array<SchemaObject | ReferenceObject>; doc: DocTechnicalField[] } {
  const specs: Array<SchemaObject | ReferenceObject> = [];
  const docs: DocTechnicalField[] = [];

  for (let i = 0; i < source.length; i++) {
    const { schema, doc } = initModelTechnicalDocFromSource(source[i], sourceLang);
    specs.push(schema);
    docs.push(doc);
  }

  return {
    schema: specs,
    doc: docs,
  };
}
