import type { SchemaObject } from "openapi3-ts/oas31";

import { offerPublishingModelDoc } from "../../docs/models/job/JobOfferPublishing.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zodOpenApi } from "../../openapi/utils/zodWithOpenApi.js";

const offerPublishingSchema = {
  type: "object",
  properties: {
    publishing: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["WILL_BE_PUBLISHED", "PUBLISHED", "WILL_NOT_BE_PUBLISHED"],
        },
        error: {
          type: "object",
          properties: {
            code: {
              type: "string",
            },
            label: {
              type: "string",
            },
          },
          required: ["code", "label"],
        },
      },
      required: ["status"],
    },
  },
  required: ["publishing"],
} as const satisfies SchemaObject;

export const offerPublishingModelOpenapi: OpenapiModel<"JobOfferPublishing"> = {
  name: "JobOfferPublishing",
  schema: offerPublishingSchema,
  doc: offerPublishingModelDoc,
  zod: zodOpenApi.unknown().openapi("JobOfferPublishing"),
};
