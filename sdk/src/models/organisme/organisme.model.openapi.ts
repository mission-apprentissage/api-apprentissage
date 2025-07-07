import { organismeModelDoc } from "../../docs/models/organisme/organisme.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zOrganisme } from "./organisme.model.js";

export const organismeModelOpenapi: OpenapiModel<"Organisme"> = {
  name: "Organisme",
  doc: organismeModelDoc,
  zod: zOrganisme,
};
