import type { OperationObject, SchemaObject } from "openapi3-ts/oas31";
import type { ZodType } from "zod";

import type { DocRoute, DocTechnicalField, OpenApiText } from "../docs/types.js";
import type { TagOpenapi } from "./tags.openapi.js";

export type OpenapiModel = {
  name: string;
  schema: SchemaObject;
  doc: DocTechnicalField;
  zod: ZodType | null;
};

export type OpenapiRoute = { tag: TagOpenapi; schema: Omit<OperationObject, "tag">; doc: DocRoute | null };

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
};
