import type { OpenApiBuilder, SchemaObject } from "openapi3-ts/oas31";

import { communeModelDoc } from "../../docs/models/commune/commune.model.doc.js";
import { addSchemaDoc } from "../../utils/zodWithOpenApi.js";

const communeSchema = {
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
    },
    region: {
      type: "object",
      properties: {
        codeInsee: { type: "string" },
        nom: { type: "string" },
      },
      required: ["codeInsee", "nom"],
    },
    departement: {
      type: "object",
      properties: {
        nom: { type: "string" },
        codeInsee: { type: "string" },
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
    localisation: {
      type: "object",
      properties: {
        centre: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["Point"] },
            coordinates: {
              type: "array",
              items: { type: "number" },
              minItems: 2,
              maxItems: 2,
            },
          },
          required: ["type", "coordinates"],
        },
        bbox: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["Polygon"] },
            coordinates: {
              type: "array",
              items: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
              },
            },
          },
          required: ["type", "coordinates"],
        },
      },
      required: ["centre", "bbox"],
    },
  },
  required: ["nom", "code", "departement", "academie", "region", "geographie"],
} as const satisfies SchemaObject;

export function registerOpenApiCommuneModel(builder: OpenApiBuilder, lang: "en" | "fr"): OpenApiBuilder {
  return builder.addSchema("Commune", addSchemaDoc(communeSchema, communeModelDoc, lang));
}
