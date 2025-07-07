import { departementModelDoc } from "../../docs/models/departement/departement.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zDepartement } from "./departement.model.js";

export const departementModelOpenapi: OpenapiModel<"Departement"> = {
  name: "Departement",
  doc: departementModelDoc,
  zod: zDepartement,
};
