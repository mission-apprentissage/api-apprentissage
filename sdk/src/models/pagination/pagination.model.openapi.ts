import type { ParameterObject } from "openapi3-ts/oas31";

import { paginationModelDoc } from "../../docs/models/pagination/pagination.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zPaginationInfo } from "./pagination.model.js";

export const paginationModelOpenapi: OpenapiModel<"Pagination"> = {
  name: "Pagination",
  schema: {
    type: "object",
    properties: {
      page_count: { type: "integer", minimum: 0 },
      page_size: { type: "integer", minimum: 1, maximum: 1_000 },
      page_index: { type: "integer", minimum: 0 },
    },
    required: ["page_count", "page_size", "page_index"],
    additionalProperties: false,
  },
  doc: paginationModelDoc,
  zod: zPaginationInfo,
};

export const paginationQueryParameterObject: ParameterObject[] = [
  {
    schema: {
      type: "integer",
      minimum: 1,
      maximum: 1_000,
      default: 100,
    },
    required: false,
    name: "page_size",
    in: "query",
  },
  {
    schema: {
      type: "integer",
      minimum: 0,
      default: 0,
    },
    allowEmptyValue: true,
    required: false,
    name: "page_index",
    in: "query",
  },
];
