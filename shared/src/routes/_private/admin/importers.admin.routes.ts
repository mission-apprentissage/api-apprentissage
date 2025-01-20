import type { IApiRoutesDef } from "api-alternance-sdk";
import { z } from "zod";

export const zImportStatus = z.object({
  last_import: z.date().nullable(),
  last_success: z.date().nullable(),
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
      response: { "200": z.record(zImportStatus) },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;
