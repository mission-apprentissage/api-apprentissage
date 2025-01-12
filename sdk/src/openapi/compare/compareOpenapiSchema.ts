import diff from "microdiff";
import type {
  ContentObject,
  OperationObject,
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
  SchemaObjectType,
} from "openapi3-ts/oas31";

type ObjectStructure =
  | SchemaObjectStructure
  | {
      _: "ref";
      $ref: ReferenceObject["$ref"];
    };

type SchemaObjectStructure = {
  _: "schema";
  discriminator: SchemaObject["discriminator"];
  type: SchemaObject["type"];
  format: SchemaObject["format"];
  allOf: ObjectStructure[] | undefined;
  oneOf: ObjectStructure[] | undefined;
  anyOf: ObjectStructure[] | undefined;
  not: ObjectStructure | undefined;
  items: ObjectStructure | undefined;
  properties: Record<string, ObjectStructure | undefined> | undefined;
  additionalProperties: SchemaObject["additionalProperties"];
  propertyNames: SchemaObject["propertyNames"];
  default: SchemaObject["default"];
  multipleOf: SchemaObject["multipleOf"];
  maximum: SchemaObject["maximum"];
  const: SchemaObject["const"];
  exclusiveMaximum: SchemaObject["exclusiveMaximum"];
  minimum: SchemaObject["minimum"];
  exclusiveMinimum: SchemaObject["exclusiveMinimum"];
  maxLength: SchemaObject["maxLength"];
  minLength: SchemaObject["minLength"];
  pattern: SchemaObject["pattern"];
  maxItems: SchemaObject["maxItems"];
  minItems: SchemaObject["minItems"];
  uniqueItems: SchemaObject["uniqueItems"];
  maxProperties: SchemaObject["maxProperties"];
  minProperties: SchemaObject["minProperties"];
  required: SchemaObject["required"];
  enum: SchemaObject["enum"];
  prefixItems: ObjectStructure[] | undefined;
  contentMediaType: SchemaObject["contentMediaType"];
  contentEncoding: SchemaObject["contentEncoding"];
};

function getSchemaObjectStructure(schema: SchemaObject | ReferenceObject | undefined): ObjectStructure | undefined {
  if (!schema) {
    return;
  }

  if ("$ref" in schema) {
    return {
      _: "ref",
      $ref: schema.$ref,
    };
  }

  return simplifySchemaObjectStructure({
    _: "schema",
    discriminator: schema.discriminator,
    type: schema.type,
    format: schema.format,
    allOf: getSchemaObjectListStructure(schema.allOf),
    oneOf: getSchemaObjectListStructure(schema.oneOf),
    anyOf: getSchemaObjectListStructure(schema.anyOf),
    not: getSchemaObjectStructure(schema.not),
    items: getSchemaObjectStructure(schema.items),
    properties: getSchemaObjectRecordStructure(schema.properties),
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
    prefixItems: getSchemaObjectListStructure(schema.prefixItems),
    contentMediaType: schema.contentMediaType,
    contentEncoding: schema.contentEncoding,
  });
}

function getNonEmptyFields(s: SchemaObjectStructure): string[] {
  return Object.entries(s)
    .filter(([k, v]) => v != null && k != "_")
    .map(([k]) => k);
}

function simplifySchemaObjectStructure(s: SchemaObjectStructure): SchemaObjectStructure | undefined {
  if (getNonEmptyFields(s).length === 0) return undefined;

  if (s.anyOf == null || s.type != null) return s;

  const resultType: SchemaObjectType[] = [];

  for (const part of s.anyOf) {
    if (part._ != "schema") return s;
    // Extra fields requirements, anyOf is required
    if (getNonEmptyFields(part).length > 1) return s;

    if (Array.isArray(part.type)) {
      resultType.push(...part.type);
    } else if (part.type) {
      resultType.push(part.type);
    }
  }

  return {
    ...s,
    type: resultType,
    anyOf: undefined,
  };
}

function getSchemaObjectListStructure(
  schema: (SchemaObject | ReferenceObject)[] | undefined
): ObjectStructure[] | undefined {
  if (!schema) {
    return;
  }

  return schema.map((s) => getSchemaObjectStructure(s)).filter((s) => s != null);
}

function getSchemaObjectRecordStructure(
  schema: Record<string, SchemaObject | ReferenceObject> | undefined
): Record<string, ObjectStructure | undefined> | undefined {
  if (!schema) {
    return;
  }

  return Object.fromEntries(Object.entries(schema).map(([k, s]) => [k, getSchemaObjectStructure(s)]));
}

function getContentObjectStructure(c: ContentObject | undefined) {
  if (!c) {
    return;
  }

  return Object.fromEntries(
    Object.entries(c).map(([k, v]) => [
      k,
      {
        schema: getSchemaObjectStructure(v.schema),
        encoding: v.encoding,
      },
    ])
  );
}

function getParametersStructure(parameters: (ParameterObject | ReferenceObject)[] | undefined) {
  if (!parameters) {
    return;
  }

  return Object.fromEntries(
    parameters.map((p, i) => {
      if ("$ref" in p) {
        return [
          `$ref:${i}`,
          {
            $ref: p.$ref,
          },
        ];
      }

      return [
        p.name,
        {
          name: p.name,
          in: p.in,
          required: p.required,
          allowEmptyValue: p.allowEmptyValue,
          schema: getSchemaObjectStructure(p.schema),
          content: getContentObjectStructure(p.content),
        },
      ];
    })
  );
}

function getRequestBodyObjectStructure(requestBody: RequestBodyObject | ReferenceObject | undefined) {
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
    content: getContentObjectStructure(requestBody.content),
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
    content: getContentObjectStructure(response.content),
  };
}

function getResponsesObjectStructure(responses: ResponsesObject | undefined) {
  if (!responses) {
    return;
  }

  return Object.fromEntries(
    Object.entries(responses)
      .filter(([k]) => k.startsWith("2"))
      .map(([k, v]) => [k, cleanResponseObject(v)])
  );
}

export function getOperationObjectStructure(
  operation: OperationObject | undefined
): Record<string, unknown> | undefined {
  if (!operation) {
    return;
  }

  const result = {
    parameters: getParametersStructure(operation.parameters),
    requestBody: getRequestBodyObjectStructure(operation.requestBody),
    responses: getResponsesObjectStructure(operation.responses),
    security: operation.security,
  };

  // Remove all undefined fields
  return JSON.parse(JSON.stringify(result));
}

export type OpenapiDiff<SourceName extends string, ResultName extends string> = {
  result: ResultName;
  source: SourceName;
  diff: Record<
    string,
    | { type: "removed"; source: unknown }
    | { type: "added"; result: unknown }
    | { type: "changed"; result: unknown; source: unknown }
  >;
};

function structureDiff<SourceName extends string, ResultName extends string>(
  value1: { name: SourceName; value: Record<string, unknown> | undefined },
  value2: { name: ResultName; value: Record<string, unknown> | undefined }
): OpenapiDiff<SourceName, ResultName> {
  const result: OpenapiDiff<SourceName, ResultName> = {
    source: value1.name,
    result: value2.name,
    diff: {},
  };

  // Remove undefined values before diffing
  const diffs = diff(JSON.parse(JSON.stringify(value1 ?? {})), JSON.parse(JSON.stringify(value2 ?? {})));

  for (const d of diffs) {
    const path = d.path.join(".");
    if (d.type === "CREATE" || (d.type === "CHANGE" && d.oldValue === undefined)) {
      result.diff[path] = { type: "added", result: d.value };
    } else if (d.type === "REMOVE" || (d.type === "CHANGE" && d.value === undefined)) {
      result.diff[path] = { type: "removed", source: d.oldValue };
    } else if (d.type === "CHANGE") {
      result.diff[path] = { type: "changed", source: d.oldValue, result: d.value };
    }
  }

  return result;
}

export function compareOperationObjects<SourceName extends string, ResultName extends string>(
  operationSource: { name: SourceName; op: OperationObject },
  operationResult: { name: ResultName; op: OperationObject | undefined }
): OpenapiDiff<SourceName, ResultName> {
  const structSource = getOperationObjectStructure(operationSource);
  const structResult = getOperationObjectStructure(operationResult);

  if (structSource?.security) {
    delete structSource.security;
  }

  if (structResult?.security) {
    delete structResult.security;
  }

  return structureDiff(
    { name: operationSource.name, value: structSource },
    { name: operationResult.name, value: structResult }
  );
}
