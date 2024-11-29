import type { OpenApiBuilder, SchemaObject } from "openapi3-ts/oas31";

import { missionLocaleModelDoc } from "../../docs/models/mission-locale/mission-locale.model.doc.js";
import { addSchemaDoc } from "../../utils/zodWithOpenApi.js";

const missionLocaleSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    nom: { type: "string" },
    siret: { type: "string" },
    localisation: {
      type: "object",
      properties: {
        geopoint: {
          type: ["object", "null"],
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
          additionalProperties: false,
          required: ["type", "coordinates"],
        },
        adresse: { type: "string" },
        cp: { type: "string" },
        ville: { type: "string" },
      },
      required: ["geopoint", "adresse", "cp", "ville"],
    },
    contact: {
      type: "object",
      properties: {
        email: { type: ["string", "null"], format: "email" },
        telephone: { type: ["string", "null"] },
        siteWeb: { type: ["string", "null"] },
      },
      required: ["email", "telephone", "siteWeb"],
    },
  },
  required: ["id", "nom", "siret", "localisation", "contact"],
} as const satisfies SchemaObject;

export function registerOpenApiMissionLocaleModel(builder: OpenApiBuilder, lang: "en" | "fr"): OpenApiBuilder {
  return builder.addSchema("MissionLocale", addSchemaDoc(missionLocaleSchema, missionLocaleModelDoc, lang));
}
