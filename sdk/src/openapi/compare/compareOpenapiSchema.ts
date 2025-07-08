import diff from "microdiff";
import type { OperationObject } from "openapi3-ts/oas31";

import { stripOperationObjectDescriptions } from "../utils/stripDescriptions.openapi.js";

export type StructureDiff<SourceName extends string, ResultName extends string> = {
  result: ResultName;
  source: SourceName;
  diff: Record<
    string,
    | { type: "removed"; source: unknown }
    | { type: "added"; result: unknown }
    | { type: "changed"; result: unknown; source: unknown }
  >;
};

function getOperationObjectStructure(op: OperationObject | undefined): Record<string, unknown> | undefined {
  const operation = stripOperationObjectDescriptions(op);

  if (!operation) {
    return;
  }

  return {
    operationId: operation.operationId,
    tags: operation.tags,
    // Convert parameters to an object with keys in the format `${in}:${name}` or `$ref`
    // This will help to compare parameters differences
    parameters: Object.fromEntries(
      operation.parameters?.map((p) => {
        if ("$ref" in p) {
          return [p.$ref, p];
        }

        return [`${p.in}:${p.name}`, p];
      }) ?? []
    ),
    requestBody: operation.requestBody,
    responses: operation.responses,
  };
}

export function structureDiff<SourceName extends string, ResultName extends string>(
  value1: { name: SourceName; value: unknown },
  value2: { name: ResultName; value: unknown }
): StructureDiff<SourceName, ResultName> | null {
  const result: StructureDiff<SourceName, ResultName> = {
    source: value1.name,
    result: value2.name,
    diff: {},
  };

  // Remove undefined values before diffing
  const diffs = diff(JSON.parse(JSON.stringify(value1.value ?? {})), JSON.parse(JSON.stringify(value2.value ?? {})));

  if (diffs.length === 0) {
    return null;
  }

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

export function compareOperationObjectsStructure<SourceName extends string, ResultName extends string>(
  operationSource: { name: SourceName; op: OperationObject | undefined },
  operationResult: { name: ResultName; op: OperationObject | undefined }
): StructureDiff<SourceName, ResultName> | null {
  const structSource = getOperationObjectStructure(operationSource.op);
  const structResult = getOperationObjectStructure(operationResult.op);

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
