import type {
  ContentObject,
  MediaTypeObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
  SchemaObjectType,
} from "openapi3-ts/oas31";

export function stripSchemaObjectDescriptions(
  schema: SchemaObject | ReferenceObject | undefined
): SchemaObject | ReferenceObject | undefined {
  if (!schema) {
    return;
  }

  if ("$ref" in schema) {
    return {
      $ref: schema.$ref,
    };
  }

  const s: SchemaObject = stripEmptyFields({
    discriminator: schema.discriminator,
    type: schema.type,
    format: schema.format,
    allOf: stripSchemaObjectListDescriptions(schema.allOf),
    oneOf: stripSchemaObjectListDescriptions(schema.oneOf),
    anyOf: stripSchemaObjectListDescriptions(schema.anyOf),
    not: stripSchemaObjectDescriptions(schema.not),
    items: stripSchemaObjectDescriptions(schema.items),
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
    prefixItems: stripSchemaObjectListDescriptions(schema.prefixItems),
    contentMediaType: schema.contentMediaType,
    contentEncoding: schema.contentEncoding,
  });

  const not = stripSchemaObjectDescriptions(schema.not);
  if (not) {
    s.not = not;
  }

  const items = stripSchemaObjectDescriptions(schema.items);
  if (items) {
    s.items = items;
  }

  const properties = schema.properties ? cleanRecord(schema.properties, stripSchemaObjectDescriptions) : null;
  if (properties) {
    s.properties = properties;
  }

  return simplifySchemaObjectStructure(s);
}

function stripEmptyFields<T extends { [k: string]: unknown }>(record: T): T {
  return Object.fromEntries(Object.entries(record).filter(([_k, v]) => v != null)) as T;
}

function getNonEmptyFields(s: SchemaObject): string[] {
  return Object.entries(s)
    .filter(([_k, v]) => v != null)
    .map(([k]) => k);
}

function simplifySchemaObjectStructure(s: SchemaObject): SchemaObject | undefined {
  if (getNonEmptyFields(s).length === 0) return undefined;

  if (s.anyOf == null || s.type != null) return s;

  const resultType: SchemaObjectType[] = [];

  for (const part of s.anyOf) {
    if ("$ref" in part) return s;
    // Extra fields requirements, anyOf is required
    if (getNonEmptyFields(part).length > 1) return s;

    if (Array.isArray(part.type)) {
      resultType.push(...part.type);
    } else if (part.type) {
      resultType.push(part.type);
    }
  }

  return stripEmptyFields({
    ...s,
    type: resultType,
    anyOf: undefined,
  });
}

function stripSchemaObjectListDescriptions(
  schema: (SchemaObject | ReferenceObject)[] | undefined
): (SchemaObject | ReferenceObject)[] | undefined {
  if (!schema) {
    return;
  }

  return schema.map((s) => stripSchemaObjectDescriptions(s)).filter((s) => s != null);
}

function stripMediaTypeObjectDescriptions(mediaType: MediaTypeObject): MediaTypeObject {
  return stripEmptyFields({
    schema: stripSchemaObjectDescriptions(mediaType.schema),
    encoding: mediaType.encoding,
  });
}

function stripContentObjectDescriptions(c: ContentObject): ContentObject {
  return cleanRecord(c, stripMediaTypeObjectDescriptions);
}

function stripParameterObjectDescriptions(
  parameter: ParameterObject | ReferenceObject | undefined
): ParameterObject | ReferenceObject | undefined {
  if (!parameter) {
    return;
  }

  if ("$ref" in parameter) {
    return {
      $ref: parameter.$ref,
    };
  }

  return stripEmptyFields({
    name: parameter.name,
    in: parameter.in,
    required: parameter.required,
    allowEmptyValue: parameter.allowEmptyValue,
    schema: stripSchemaObjectDescriptions(parameter.schema),
    content: parameter.content ? stripContentObjectDescriptions(parameter.content) : undefined,
  });
}

function stripParametersDescriptions(
  parameters: (ParameterObject | ReferenceObject)[] | undefined
): (ParameterObject | ReferenceObject)[] | undefined {
  if (!parameters) {
    return;
  }

  return parameters
    .map(stripParameterObjectDescriptions)
    .filter((p) => p != null)
    .toSorted((a, b) => {
      if ("$ref" in a && "$ref" in b) {
        return a.$ref.localeCompare(b.$ref);
      }

      if ("$ref" in a) return -1;
      if ("$ref" in b) return 1;

      return a.name.localeCompare(b.name);
    });
}

function stripRequestBodyObjectDescriptions(
  requestBody: RequestBodyObject | ReferenceObject | undefined
): RequestBodyObject | ReferenceObject | undefined {
  if (!requestBody) {
    return;
  }
  if ("$ref" in requestBody) {
    return {
      $ref: requestBody.$ref,
    };
  }

  return stripEmptyFields({
    content: stripContentObjectDescriptions(requestBody.content),
    required: requestBody.required,
  });
}

function cleanResponseObject(response: ResponseObject | ReferenceObject): ResponseObject | ReferenceObject {
  if ("$ref" in response) {
    return {
      $ref: response.$ref,
    };
  }

  return stripEmptyFields({
    headers: response.headers,
    description: "",
    content: response.content ? stripContentObjectDescriptions(response.content) : response.content,
  });
}

function stripResponsesObjectDescriptions(responses: ResponsesObject | undefined) {
  if (!responses) {
    return;
  }

  return Object.fromEntries(
    Object.entries(responses)
      .filter(([k]) => k.startsWith("2"))
      .map(([k, v]) => [k, cleanResponseObject(v)])
  );
}

export function stripOperationObjectDescriptions(operation: OperationObject | undefined): OperationObject | undefined {
  if (!operation) {
    return;
  }

  return stripEmptyFields({
    parameters: operation.parameters ? stripParametersDescriptions(operation.parameters) : operation.parameters,
    requestBody: stripRequestBodyObjectDescriptions(operation.requestBody),
    responses: stripResponsesObjectDescriptions(operation.responses),
    security: operation.security,
  });
}

function stripPathItemObjectDescriptions(item: PathItemObject): PathItemObject {
  return stripEmptyFields({
    $ref: item.$ref,
    get: stripOperationObjectDescriptions(item.get),
    put: stripOperationObjectDescriptions(item.put),
    post: stripOperationObjectDescriptions(item.post),
    delete: stripOperationObjectDescriptions(item.delete),
    options: stripOperationObjectDescriptions(item.options),
    head: stripOperationObjectDescriptions(item.head),
    patch: stripOperationObjectDescriptions(item.patch),
    trace: stripOperationObjectDescriptions(item.trace),
    servers: item.servers,
    parameters: item.parameters?.map(stripParameterObjectDescriptions).filter((p) => p != null),
  });
}

function cleanRecord<T>(record: Record<string, T>, mapper: (v: T) => T | undefined): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record)
      .map(([k, v]) => [k, mapper(v)])
      .filter(([_k, v]) => v != null)
  );
}

export function stripOpenAPIObjectDescriptions(doc: OpenAPIObject): OpenAPIObject {
  return stripEmptyFields({
    openapi: doc.openapi,
    info: stripEmptyFields({
      title: doc.info.title,
      termsOfService: doc.info.termsOfService,
      contact: doc.info.contact,
      license: doc.info.license,
      version: doc.info.version,
    }),
    servers: doc.servers,
    paths: Object.fromEntries(Object.entries(doc.paths ?? {}).map(([k, v]) => [k, stripPathItemObjectDescriptions(v)])),
    components: stripEmptyFields({
      schemas: cleanRecord(doc.components?.schemas ?? {}, stripSchemaObjectDescriptions),
      responses: cleanRecord(doc.components?.responses ?? {}, cleanResponseObject),
      parameters: cleanRecord(doc.components?.parameters ?? {}, stripParameterObjectDescriptions),
      requestBodies: cleanRecord(doc.components?.requestBodies ?? {}, stripRequestBodyObjectDescriptions),
      headers: doc.components?.headers,
      securitySchemes: doc.components?.securitySchemes,
      links: doc.components?.links,
      callbacks: doc.components?.callbacks,
    }),
    security: doc.security,
    tags: doc.tags,
    externalDocs: doc.externalDocs,
    webhooks: doc.webhooks,
  });
}
