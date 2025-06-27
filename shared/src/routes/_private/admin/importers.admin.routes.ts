import type { IApiRoutesDef } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

export const zImportStatus = z.object({
  last_import: z.nullable(z.date()),
  last_success: z.nullable(z.date()),
  status: z.enum(["done", "failed", "pending"]),
  resources: z.array(
    z.object({
      name: z.string(),
      import_date: z.date(),
      status: z.enum(["done", "failed", "pending"]),
    })
  ),
});

export type ImportStatus = z.infer<typeof zImportStatus>;

export const zImporterAdminRoutes = {
  get: {
    "/_private/importers/status": {
      method: "get",
      path: "/_private/importers/status",
      response: { "200": z.record(z.string(), zImportStatus) },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;
