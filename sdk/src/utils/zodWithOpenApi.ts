import { extendZodWithOpenApi as extendZodWithOpenApiBase } from "@asteasolutions/zod-to-openapi";
import type { SchemaObject } from "openapi3-ts/oas31";
import { z } from "zod";

import type { DocBusinessField, DocTechnicalField } from "../internal.js";

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

  if (field.type === "business" && field.information) {
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
    r.examples = field.examples;
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

export { zodOpenApi, buildOpenApiDescriptionLegacy, getDocOpenAPIAttributes, pickPropertiesOpenAPI };
