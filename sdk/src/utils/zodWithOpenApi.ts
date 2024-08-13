import { extendZodWithOpenApi as extendZodWithOpenApiBase } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

function extendZodWithOpenApi<T extends typeof z>(zod: T): T {
  extendZodWithOpenApiBase(zod);

  return zod;
}

const zodOpenApi = extendZodWithOpenApi(z);

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

export { zodOpenApi, buildOpenApiDescription, buildOpenApiMdTable };
