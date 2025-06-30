import type { SchemaObject } from "openapi3-ts/oas31";

import type { OpenapiModel } from "../../openapi/types.js";
import { zodOpenApi } from "../../openapi/utils/zodWithOpenApi.js";
import { offerExportModelDoc } from "../../docs/models/job/JobOfferExport.doc.js";

const offerExportSchema = {
  type: "object",
  properties: {
    url: { type: "string" },
    lastUpdate: { type: "string", format: "date-time" },
  },
  required: ["url", "lastUpdate"],
} as const satisfies SchemaObject;

export const offerExportModelOpenapi: OpenapiModel<"JobOfferExport"> = {
  name: "JobOfferExport",
  schema: offerExportSchema,
  doc: offerExportModelDoc,
  zod: zodOpenApi.unknown().openapi("JobOfferExport"),
};
