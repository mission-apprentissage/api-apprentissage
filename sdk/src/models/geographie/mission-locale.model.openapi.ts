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
          oneOf: [
            { type: "null" },
            {
              $ref: "#/components/schemas/GeoJsonPoint",
            },
          ],
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
  required: ["id", "code", "nom", "siret", "localisation", "contact"],
};

export const missionLocaleModelOpenapi: OpenapiModel<"MissionLocale"> = {
  name: "MissionLocale",
  schema: missionLocaleSchema,
  doc: missionLocaleModelDoc,
  zod: zMissionLocale,
};
