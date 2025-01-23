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
    type: { type: "string", enum: ["Point"] },
    coordinates: {
      type: "array",
      prefixItems: [
        { type: "number", minimum: -180, maximum: 180 },
        { type: "number", minimum: -90, maximum: 90 },
      ],
      minItems: 2,
      maxItems: 2,
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
    type: { type: "string", enum: ["Polygon"] },
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
          minItems: 2,
          maxItems: 2,
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
    },
    code_postal: {
      type: ["string", "null"],
    },
    commune: {
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
    },
    label: {
      type: ["string", "null"],
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
    },
  },
  required: ["academie", "code_postal", "commune", "departement", "label", "region"],
  type: "object",
};

export const adresseModelOpenapi: OpenapiModel<"Adresse"> = {
  name: "Adresse",
  schema: adresseSchema,
  doc: adresseModelDoc,
  zod: zAdresse,
};
