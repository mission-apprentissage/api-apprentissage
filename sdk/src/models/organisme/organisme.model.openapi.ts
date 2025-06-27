import { organismeModelDoc } from "../../docs/models/organisme/organisme.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zOrganisme } from "./organisme.model.js";

export const organismeModelOpenapi: OpenapiModel<"Organisme"> = {
  name: "Organisme",
  schema: {
    type: "object",
    properties: {
      contacts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              pattern:
                "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
            },
            sources: {
              type: "array",
              items: {
                type: "string",
              },
            },
            confirmation_referentiel: {
              type: "boolean",
            },
          },
          required: ["email", "sources", "confirmation_referentiel"],
          additionalProperties: false,
        },
      },
      etablissement: {
        properties: {
          adresse: {
            anyOf: [{ $ref: "#/components/schemas/Adresse" }, { type: "null" }],
          },
          geopoint: {
            anyOf: [{ $ref: "#/components/schemas/GeoJsonPoint" }, { type: "null" }],
          },
          creation: {
            format: "date-time",
            type: "string",
          },
          enseigne: { anyOf: [{ type: "string", minLength: 1 }, { type: "null" }] },
          fermeture: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
          ouvert: {
            type: "boolean",
          },
          siret: {
            pattern: "^\\d{14}$",
            type: "string",
          },
        },
        required: ["adresse", "geopoint", "creation", "enseigne", "fermeture", "ouvert", "siret"],
        type: "object",
        additionalProperties: false,
      },
      identifiant: {
        properties: {
          siret: { type: "string", pattern: "^\\d{14}$" },
          uai: { anyOf: [{ type: "string", pattern: "^\\d{7}[A-Z]$" }, { type: "null" }] },
        },
        required: ["siret", "uai"],
        type: "object",
        additionalProperties: false,
      },
      renseignements_specifiques: {
        properties: {
          numero_activite: { anyOf: [{ type: "string" }, { type: "null" }] },
          qualiopi: {
            type: "boolean",
          },
        },
        required: ["numero_activite", "qualiopi"],
        type: "object",
        additionalProperties: false,
      },
      statut: {
        properties: {
          referentiel: {
            enum: ["présent", "supprimé"],
            type: "string",
          },
        },
        required: ["referentiel"],
        type: "object",
        additionalProperties: false,
      },
      unite_legale: {
        properties: {
          actif: {
            type: "boolean",
          },
          cessation: {
            anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
          },
          creation: { type: "string", format: "date-time" },
          raison_sociale: {
            type: "string",
          },
          siren: {
            type: "string",
          },
        },
        required: ["actif", "cessation", "creation", "raison_sociale", "siren"],
        type: "object",
        additionalProperties: false,
      },
    },
    required: ["contacts", "etablissement", "identifiant", "renseignements_specifiques", "statut", "unite_legale"],
    additionalProperties: false,
  },
  doc: organismeModelDoc,
  zod: zOrganisme,
};
