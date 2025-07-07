import { formationModelDoc } from "../../docs/models/formation/formation.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zFormation } from "./formation.model.js";

export const formationModelOpenapi: OpenapiModel<"Formation"> = {
  name: "Formation",
  doc: formationModelDoc,
  zod: zFormation,
};
