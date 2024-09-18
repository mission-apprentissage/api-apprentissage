import { extendZodWithOpenApi as extendZodWithOpenApiBase } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import type { DocTechnicalField } from "../internal.js";

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

function buildOpenApiDescription(field: Pick<DocTechnicalField, "notes" | "description">): string {
  const d: string[] = [];
  if (field.description) {
    d.push(field.description);
  }
  if (field.notes) {
    d.push("Notes:");
    d.push(field.notes);
  }

  return d.join("\n\n");
}

function buildOpenApiMdTable(rows: string[]): string {
  return rows.join("\n");
}

export { zodOpenApi, buildOpenApiDescriptionLegacy, buildOpenApiDescription, buildOpenApiMdTable };
