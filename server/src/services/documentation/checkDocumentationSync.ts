import { internal } from "@hapi/boom";
import type { OpenapiOperation, StructureDiff } from "api-alternance-sdk/internal";
import {
  compareOperationObjectsStructure,
  dereferenceOpenapiSchema,
  getOpenapiOperations,
  structureDiff,
} from "api-alternance-sdk/internal";
import { generateOpenApiSchema } from "shared/openapi/generateOpenapi";

import config from "@/config.js";
import logger from "@/services/logger.js";

import { expectedDocumentationDelta } from "./expectedDocumentationDelta.js";

const OPERATION_MAPPING: Record<string, string> = {
  "get:/job/v1/search": "get:/v3/jobs/search",
  "post:/job/v1/offer": "post:/v3/jobs",
  "put:/job/v1/offer/{id}": "put:/v3/jobs/{id}",
  "post:/job/v1/apply": "post:/v2/application",
};

async function fetchLbaOperations(): Promise<Record<string, OpenapiOperation>> {
  const response = await fetch(`${config.api.lba.endpoint}/docs/json`);
  const data = await response.json();

  const doc = await dereferenceOpenapiSchema(data);

  if (doc.openapi !== "3.1.0") {
    throw new Error("Unsupported OpenAPI version");
  }

  const operations = Object.values(OPERATION_MAPPING);

  return Object.fromEntries(Object.entries(getOpenapiOperations(doc.paths)).filter(([id]) => operations.includes(id)));
}

async function buildApiOpenapiPathItems(): Promise<Record<string, OpenapiOperation>> {
  const data = generateOpenApiSchema(config.version, config.env, config.apiPublicUrl, "fr");

  const doc = await dereferenceOpenapiSchema(data);

  if (doc.openapi !== "3.1.0") {
    throw new Error("Unsupported OpenAPI version");
  }

  return Object.fromEntries(Object.entries(getOpenapiOperations(doc.paths)).filter(([id]) => id in OPERATION_MAPPING));
}

export async function checkDocumentationSync() {
  const [lbaOperations, apiOperations] = await Promise.all([fetchLbaOperations(), buildApiOpenapiPathItems()]);

  const result: Record<string, StructureDiff<"lba", "api">> = {};

  for (const id of Object.keys(apiOperations)) {
    const apiOperation = apiOperations[id];
    const lbaOperation = lbaOperations[OPERATION_MAPPING[id]] ?? null;

    const d = compareOperationObjectsStructure(
      { name: "lba", op: lbaOperation.operation },
      { name: "api", op: apiOperation?.operation }
    );

    if (d !== null) {
      result[id] = d;
    }
  }

  const delta = structureDiff(
    {
      name: "expected",
      value: expectedDocumentationDelta,
    },
    { name: "actual", value: result }
  );

  if (delta) {
    const message = `checkDocumentationSync: API Alternance documentation is not in sync with LBA`;
    logger.error(message, { delta, result });
    throw internal(message, { delta, result });
  }
}
