import type { SchemaObject } from "openapi3-ts/oas31";

import { missionLocaleModelDoc } from "../../docs/models/mission-locale/mission-locale.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zMissionLocale } from "./mission-locale.model.js";

const missionLocaleSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "number" },
    code: { type: "string" },
    nom: { type: "string" },
    siret: { type: "string" },
    localisation: {
      type: "object",
      properties: {
        geopoint: {
          anyOf: [
            {
              $ref: "#/components/schemas/GeoJsonPoint",
            },
            { type: "null" },
          ],
        },
        adresse: { type: "string" },
        cp: { type: "string" },
        ville: { type: "string" },
      },
      required: ["geopoint", "adresse", "cp", "ville"],
      additionalProperties: false,
    },
    contact: {
      type: "object",
      properties: {
        email: {
          anyOf: [
            {
              type: "string",
              format: "email",
              pattern:
                "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
            },
            { type: "null" },
          ],
        },
        telephone: { anyOf: [{ type: "string" }, { type: "null" }] },
        siteWeb: { anyOf: [{ type: "string" }, { type: "null" }] },
      },
      required: ["email", "telephone", "siteWeb"],
      additionalProperties: false,
    },
  },
  required: ["id", "code", "nom", "siret", "localisation", "contact"],
  additionalProperties: false,
};

export const missionLocaleModelOpenapi: OpenapiModel<"MissionLocale"> = {
  name: "MissionLocale",
  schema: missionLocaleSchema,
  doc: missionLocaleModelDoc,
  zod: zMissionLocale,
};
