import type { SchemaObject } from "openapi3-ts/oas31";

import { departementModelDoc } from "../../docs/models/departement/departement.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zDepartement } from "./departement.model.js";

const departementSchema = {
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
    },
    academie: {
      type: "object",
      properties: {
        id: { type: "string" },
        code: { type: "string" },
        nom: { type: "string" },
      },
      required: ["id", "code", "nom"],
    },
  },
  required: ["nom", "codeInsee", "academie", "region"],
} as const satisfies SchemaObject;

export const departementModelOpenapi = {
  name: "Departement",
  schema: departementSchema,
  doc: departementModelDoc,
  zod: zDepartement,
} as const satisfies OpenapiModel;
