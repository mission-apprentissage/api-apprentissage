import { internal } from "@hapi/boom";
import OpenAPIParser from "@readme/openapi-parser";
import type { Difference } from "microdiff";
import diff from "microdiff";
import type { OpenAPIObject, OperationObject, PathsObject } from "openapi3-ts/oas31";
import { getPath } from "openapi3-ts/oas31";
import { getOperationObjectStructure } from "shared/helpers/openapi/compareOpenapiStructure";
import { generateOpenApiSchema } from "shared/helpers/openapi/generateOpenapi";

import config from "@/config.js";
import logger from "@/services/logger.js";

import { expectedDocumentationDelta } from "./expectedDocumentationDelta.js";

const OPERATION_MAPPING: Record<string, string> = {
  "get:/job/v1/search": "get:/v3/jobs/search",
  "post:/job/v1/offer": "post:/v3/jobs",
  "put:/job/v1/offer/{id}": "put:/v3/jobs/{id}",
};

async function dereferenceSchema(data: OpenAPIObject): Promise<OpenAPIObject> {
  if (data.openapi !== "3.1.0") {
    throw internal("Unsupported OpenAPI version");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await OpenAPIParser.dereference(data as any)) as any;
}

type Operation = {
  id: string;
  method: "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace";
  operation: OperationObject;
  path: string;
};

function isOperationMethod(method: string): method is Operation["method"] {
  return ["get", "post", "put", "delete", "patch", "head", "options", "trace"].includes(method);
}

function getOperations(paths: PathsObject | undefined): Operation[] {
  if (paths == null) return [];

  return Object.keys(paths).flatMap((path) => {
    const pathItem = getPath(paths, path);

    if (!pathItem) {
      throw internal("unexpected: PathItem not found");
    }

    return Object.keys(pathItem)
      .map((method): Operation | null => {
        if (!isOperationMethod(method)) {
          return null;
        }

        const operation = pathItem[method];
        if (!operation) {
          return null;
        }

        return { id: `${method}:${path}`, method: method, operation, path };
      })
      .filter((operation): operation is Operation => operation !== null);
  });
}

async function fetchLbaOperations(): Promise<Operation[]> {
  const response = await fetch(`${config.api.lba.endpoint}/docs/json`);
  const data = await response.json();

  const doc = await dereferenceSchema(data);

  if (doc.openapi !== "3.1.0") {
    throw new Error("Unsupported OpenAPI version");
  }

  return getOperations(doc.paths).filter((op) => op.path.startsWith("/v3/jobs"));
}

async function buildApiOpenapiPathItems(): Promise<Operation[]> {
  const data = generateOpenApiSchema(config.version, config.env, config.apiPublicUrl, "fr");

  const doc = await dereferenceSchema(data);

  if (doc.openapi !== "3.1.0") {
    throw new Error("Unsupported OpenAPI version");
  }

  return getOperations(doc.paths).filter((op) => op.path.startsWith("/job/v1"));
}

function compareOperationObjects(operation1: OperationObject, operation2: OperationObject | undefined): Difference[] {
  const s1 = getOperationObjectStructure(operation1);
  const s2 = getOperationObjectStructure(operation2);

  if (s1?.security) {
    delete s1.security;
  }

  if (s2?.security) {
    delete s2.security;
  }

  return diff(s1 ?? {}, s2 ?? {});
}

export async function checkDocumentationSync() {
  const [lbaOperations, apiOperations] = await Promise.all([fetchLbaOperations(), buildApiOpenapiPathItems()]);

  const result: Record<string, Difference[]> = {};

  for (const apiOperation of apiOperations) {
    const lbaOperation = lbaOperations.find((op) => op.id === OPERATION_MAPPING[apiOperation.id]) ?? null;

    const d = compareOperationObjects(apiOperation.operation, lbaOperation?.operation);
    result[apiOperation.id] = d;
  }

  const delta = diff(expectedDocumentationDelta, result).filter((d) => {
    if (d.type === "CHANGE") return true;
    if (d.type === "CREATE") return d.value !== undefined;
    return d.oldValue !== undefined;
  });

  if (delta.length > 0) {
    const message = `checkDocumentationSync: API Alternance documentation is not in sync with LBA`;
    logger.error(message, { delta });
    throw internal(message, { delta, result });
  }
}
