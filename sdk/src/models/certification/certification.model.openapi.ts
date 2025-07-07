import { certificationModelDoc } from "../../docs/models/certification/certification.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zCertification } from "./certification.model.js";

export const certificationModelOpenapi: OpenapiModel<"Certification"> = {
  name: "Certification",
  doc: certificationModelDoc,
  zod: zCertification,
};
