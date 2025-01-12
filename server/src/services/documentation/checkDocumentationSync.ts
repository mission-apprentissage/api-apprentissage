import { internal } from "@hapi/boom";
import type { OpenapiOperation } from "api-alternance-sdk/internal";
import {
  dereferenceOpenapiSchema,
  getOpeanipOperations,
  getOperationObjectStructure,
} from "api-alternance-sdk/internal";
import diff from "microdiff";
import type { OperationObject } from "openapi3-ts/oas31";
import { generateOpenApiSchema } from "shared/openapi/generateOpenapi";

import config from "@/config.js";
import logger from "@/services/logger.js";

import type { StructuredDiff } from "./expectedDocumentationDelta.js";
import { expectedDocumentationDelta } from "./expectedDocumentationDelta.js";

const OPERATION_MAPPING: Record<string, string> = {
  "get:/job/v1/search": "get:/v3/jobs/search",
  "post:/job/v1/offer": "post:/v3/jobs",
  "put:/job/v1/offer/{id}": "put:/v3/jobs/{id}",
  "post:/job/v1/apply": "post:/v2/application",
};

async function fetchLbaOperations(): Promise<OpenapiOperation[]> {
  const response = await fetch(`${config.api.lba.endpoint}/docs/json`);
  const data = await response.json();

  const doc = await dereferenceOpenapiSchema(data);

  if (doc.openapi !== "3.1.0") {
    throw new Error("Unsupported OpenAPI version");
  }

  const operations = Object.values(OPERATION_MAPPING);

  return getOpeanipOperations(doc.paths).filter((op) => operations.includes(op.id));
}

async function buildApiOpenapiPathItems(): Promise<OpenapiOperation[]> {
  const data = generateOpenApiSchema(config.version, config.env, config.apiPublicUrl, "fr");

  const doc = await dereferenceOpenapiSchema(data);

  if (doc.openapi !== "3.1.0") {
    throw new Error("Unsupported OpenAPI version");
  }

  return getOpeanipOperations(doc.paths).filter((op) => op.id in OPERATION_MAPPING);
}

function structureDiff(
  apiValue: Record<string, unknown> | undefined,
  sourceValue: Record<string, unknown> | undefined
): StructuredDiff {
  const result: StructuredDiff = {};

  // Remove undefined values before diffing
  const diffs = diff(JSON.parse(JSON.stringify(apiValue ?? {})), JSON.parse(JSON.stringify(sourceValue ?? {})));

  for (const d of diffs) {
    const path = d.path.join(".");
    if (d.type === "CREATE" || (d.type === "CHANGE" && d.oldValue === undefined)) {
      result[path] = { type: "added", sourceValue: d.value };
    } else if (d.type === "REMOVE" || (d.type === "CHANGE" && d.value === undefined)) {
      result[path] = { type: "removed", apiValue: d.oldValue };
    } else if (d.type === "CHANGE") {
      result[path] = { type: "changed", apiValue: d.oldValue, sourceValue: d.value };
    }
  }

  return result;
}

function compareOperationObjects(
  operationApi: OperationObject,
  operationSource: OperationObject | undefined
): StructuredDiff {
  const apiStruc = getOperationObjectStructure(operationApi);
  const sourceStruc = getOperationObjectStructure(operationSource);

  if (apiStruc?.security) {
    delete apiStruc.security;
  }

  if (sourceStruc?.security) {
    delete sourceStruc.security;
  }

  return structureDiff(apiStruc, sourceStruc);
}

export async function checkDocumentationSync() {
  const [lbaOperations, apiOperations] = await Promise.all([fetchLbaOperations(), buildApiOpenapiPathItems()]);

  const result: Record<string, StructuredDiff> = {};

  for (const apiOperation of apiOperations) {
    const lbaOperation = lbaOperations.find((op) => op.id === OPERATION_MAPPING[apiOperation.id]) ?? null;

    const d = compareOperationObjects(apiOperation.operation, lbaOperation?.operation);
    result[apiOperation.id] = d;
  }

  const delta = structureDiff(expectedDocumentationDelta, result);

  if (Object.keys(delta).length > 0) {
    const message = `checkDocumentationSync: API Alternance documentation is not in sync with LBA`;
    logger.error(message, { delta, result });
    throw internal(message, { delta, result });
  }
}
