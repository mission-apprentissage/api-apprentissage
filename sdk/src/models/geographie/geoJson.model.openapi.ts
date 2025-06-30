import type { SchemaObject } from "openapi3-ts/oas31";

import {
  adresseModelDoc,
  geoJsonPointModelDoc,
  geoJsonPolygonModelDoc,
} from "../../docs/models/geoJson/geoJson.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zAdresse, zGeoJsonPoint, zGeoJsonPolygon } from "./geoJson.model.js";

const geoJsonPointSchema: SchemaObject = {
  type: "object",
  properties: {
    type: { type: "string", const: "Point" },
    coordinates: {
      type: "array",
      prefixItems: [
        { type: "number", minimum: -180, maximum: 180 },
        { type: "number", minimum: -90, maximum: 90 },
      ],
    },
  },
  required: ["type", "coordinates"],
  additionalProperties: false,
};

export const geoJsonPointModelOpenapi: OpenapiModel<"GeoJsonPoint"> = {
  name: "GeoJsonPoint",
  schema: geoJsonPointSchema,
  doc: geoJsonPointModelDoc,
  zod: zGeoJsonPoint,
};

const geoJsonPolygonSchema: SchemaObject = {
  type: "object",
  properties: {
    type: { type: "string", const: "Polygon" },
    coordinates: {
      type: "array",
      items: {
        type: "array",
        items: {
          type: "array",
          prefixItems: [
            { type: "number", minimum: -180, maximum: 180 },
            { type: "number", minimum: -90, maximum: 90 },
          ],
        },
      },
    },
  },
  required: ["type", "coordinates"],
  additionalProperties: false,
};

export const geoJsonPolygonModelOpenapi: OpenapiModel<"GeoJsonPolygon"> = {
  name: "GeoJsonPolygon",
  schema: geoJsonPolygonSchema,
  doc: geoJsonPolygonModelDoc,
  zod: zGeoJsonPolygon,
};

const adresseSchema: SchemaObject = {
  properties: {
    academie: {
      properties: {
        code: {
          type: "string",
        },
        id: {
          type: "string",
        },
        nom: {
          type: "string",
        },
      },
      required: ["code", "id", "nom"],
      type: "object",
      additionalProperties: false,
    },
    code_postal: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    commune: {
      properties: {
        code_insee: { type: "string" },
        nom: {
          type: "string",
        },
      },
      required: ["code_insee", "nom"],
      type: "object",
      additionalProperties: false,
    },
    departement: {
      properties: {
        code_insee: {
          type: "string",
        },
        nom: {
          type: "string",
        },
      },
      required: ["code_insee", "nom"],
      type: "object",
      additionalProperties: false,
    },
    label: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    region: {
      properties: {
        code_insee: {
          type: "string",
        },
        nom: {
          type: "string",
        },
      },
      required: ["code_insee", "nom"],
      type: "object",
      additionalProperties: false,
    },
  },
  required: ["academie", "code_postal", "commune", "departement", "label", "region"],
  type: "object",
  additionalProperties: false,
};

export const adresseModelOpenapi: OpenapiModel<"Adresse"> = {
  name: "Adresse",
  schema: adresseSchema,
  doc: adresseModelDoc,
  zod: zAdresse,
};
