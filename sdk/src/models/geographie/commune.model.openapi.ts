import type { SchemaObject } from "openapi3-ts/oas31";

import { communeModelDoc } from "../../docs/models/commune/commune.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zCommune } from "./commune.model.js";

const communeSchema: SchemaObject = {
  type: "object",
  properties: {
    nom: { type: "string" },
    code: {
      type: "object",
      properties: {
        insee: { type: "string" },
        postaux: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["insee", "postaux"],
      additionalProperties: false,
    },
    anciennes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          codeInsee: { type: "string" },
          nom: { type: "string" },
        },
        required: ["codeInsee", "nom"],
        additionalProperties: false,
      },
    },
    arrondissements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          code: { type: "string" },
          nom: { type: "string" },
        },
        required: ["code", "nom"],
        additionalProperties: false,
      },
    },
    region: {
      type: "object",
      properties: {
        codeInsee: { type: "string" },
        nom: { type: "string" },
      },
      required: ["codeInsee", "nom"],
      additionalProperties: false,
    },
    departement: {
      type: "object",
      properties: {
        nom: { type: "string" },
        codeInsee: { type: "string" },
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
    localisation: {
      type: "object",
      properties: {
        centre: {
          $ref: "#/components/schemas/GeoJsonPoint",
        },
        bbox: {
          $ref: "#/components/schemas/GeoJsonPolygon",
        },
      },
      required: ["centre", "bbox"],
      additionalProperties: false,
    },
    mission_locale: {
      anyOf: [{ $ref: "#/components/schemas/MissionLocale" }, { type: "null" }],
    },
  },
  required: [
    "nom",
    "code",
    "departement",
    "academie",
    "region",
    "localisation",
    "mission_locale",
    "arrondissements",
    "anciennes",
  ],
  additionalProperties: false,
};

export const communeModelOpenapi: OpenapiModel<"Commune"> = {
  name: "Commune",
  schema: communeSchema,
  doc: communeModelDoc,
  zod: zCommune,
};
