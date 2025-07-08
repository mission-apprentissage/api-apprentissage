import { communeModelDoc } from "../../docs/models/commune/commune.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zCommune } from "./commune.model.js";

export const communeModelOpenapi: OpenapiModel<"Commune"> = {
  name: "Commune",
  doc: communeModelDoc,
  zod: zCommune,
};
