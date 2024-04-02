import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

function buildOpenApiDescription(description: string | string[], notes: string[] = []): string {
  const d = Array.isArray(description) ? description : [description];
  if (notes.length > 0) {
    d.push("Notes:");
    d.push(...notes);
  }

  return d.join("\n\n");
}

function buildOpenApiMdTable(rows: string[]): string {
  return rows.join("\n");
}

export { z as zodOpenApi, buildOpenApiDescription, buildOpenApiMdTable };
