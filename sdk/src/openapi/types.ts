import type { OperationObject, SchemaObject } from "openapi3-ts/oas31";
import type { ZodTypeAny } from "zod";

import type { DocModel, DocRoute, OpenApiText } from "../docs/types.js";
import type { TagOpenapi } from "./tags.openapi.js";

export type OpenapiModel = {
  name: string;
  zod: ZodTypeAny;
  schema: SchemaObject;
  doc: DocModel;
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
