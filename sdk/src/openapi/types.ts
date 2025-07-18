import type { OperationObject, SchemaObject } from "openapi3-ts/oas31";

import type { $ZodType, $ZodUnknown } from "zod/v4/core";
import type { DocRoute, DocTechnicalField, OpenApiText } from "../docs/types.js";
import type { Permission } from "../routes/security/permissions.js";
import type { TagOpenapi } from "./tags.openapi.js";

export type OpenapiModel<T extends string = string> =
  | {
      name: T;
      schema: SchemaObject;
      doc: DocTechnicalField;
      zod: $ZodUnknown;
    }
  | {
      name: T;
      doc: DocTechnicalField;
      zod: $ZodType;
    };

export type OpenapiRoute = { tag: TagOpenapi; schema?: Omit<OperationObject, "tag">; doc: DocRoute | null };

export type OpenapiRoutes = Record<
  string,
  Partial<Record<"get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace", OpenapiRoute>>
>;

export type OpenapiSpec = {
  models: Record<string, OpenapiModel>;
  routes: OpenapiRoutes;
  tags: Record<
    string,
    {
      name: OpenApiText;
      description: OpenApiText;
    }
  >;
  demandeHabilitations: Record<
    Exclude<Permission, "admin" | "user:manage">,
    {
      subject: OpenApiText;
      body: OpenApiText;
    }
  >;
};
