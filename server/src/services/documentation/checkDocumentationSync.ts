import { internal } from "@hapi/boom";
import { dereference } from "@readme/openapi-parser";
import type { OpenapiOperation, StructureDiff } from "api-alternance-sdk/internal";
import { compareOperationObjectsStructure, getOpenapiOperations, structureDiff } from "api-alternance-sdk/internal";
import type { OpenAPIObject } from "openapi3-ts/oas31";
import { generateOpenApiSchema } from "shared/openapi/generateOpenapi";

import { expectedDocumentationDelta } from "./expectedDocumentationDelta.js";
import config from "@/config.js";
import logger from "@/services/logger.js";

const OPERATION_MAPPING: Record<string, string> = {
  "get:/job/v1/search": "get:/v3/jobs/search",
  "post:/job/v1/offer": "post:/v3/jobs",
  "put:/job/v1/offer/{id}": "put:/v3/jobs/{id}",
  "post:/job/v1/apply": "post:/v2/application",
  "get:/job/v1/offer/{id}/publishing-informations": "get:/v3/jobs/{id}/publishing-informations",
  "get:/job/v1/export": "get:/v3/jobs/export",
  "post:/formation/v1/appointment/generate-link": "post:/v2/appointment",
};
async function dereferenceOpenapiSchema(data: OpenAPIObject): Promise<OpenAPIObject> {
  if (data.openapi !== "3.1.0") {
    throw new Error("Unsupported OpenAPI version");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await dereference(data as any)) as any;
}
async function fetchLbaOperations(): Promise<Record<string, OpenapiOperation>> {
  const response = await fetch(`${config.api.lba.endpoint}/docs/json`);
  const data = await response.json();

  const doc = await dereferenceOpenapiSchema(data as OpenAPIObject);

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
    { name: "expected", value: expectedDocumentationDelta },
    { name: "actual", value: result }
  );

  if (delta) {
    const message = `checkDocumentationSync: API Alternance documentation is not in sync with LBA`;
    logger.error({ delta, result }, message);
    throw internal(message, { delta, result });
  }
}
