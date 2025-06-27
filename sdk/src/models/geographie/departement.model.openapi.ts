import type { SchemaObject } from "openapi3-ts/oas31";

import { departementModelDoc } from "../../docs/models/departement/departement.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zDepartement } from "./departement.model.js";

const departementSchema: SchemaObject = {
  type: "object",
  properties: {
    nom: { type: "string" },
    codeInsee: { type: "string" },
    region: {
      type: "object",
      properties: {
        codeInsee: { type: "string" },
        nom: { type: "string" },
      },
      required: ["codeInsee", "nom"],
      additionalProperties: false,
    },
    academie: {
      type: "object",
      properties: {
        id: { type: "string" },
        code: { type: "string" },
        nom: { type: "string" },
      },
      required: ["id", "code", "nom"],
      additionalProperties: false,
    },
  },
  required: ["nom", "codeInsee", "academie", "region"],
  additionalProperties: false,
};

export const departementModelOpenapi: OpenapiModel<"Departement"> = {
  name: "Departement",
  schema: departementSchema,
  doc: departementModelDoc,
  zod: zDepartement,
};
