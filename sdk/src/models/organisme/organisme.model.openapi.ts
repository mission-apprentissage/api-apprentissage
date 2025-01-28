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
        },
      },
      etablissement: {
        properties: {
          adresse: {
            oneOf: [{ $ref: "#/components/schemas/Adresse" }, { type: "null" }],
          },
          creation: {
            format: "date-time",
            type: "string",
          },
          enseigne: {
            type: ["string", "null"],
          },
          fermeture: {
            format: "date-time",
            type: ["string", "null"],
          },
          ouvert: {
            type: "boolean",
          },
          siret: {
            pattern: "^\\d{9,14}$",
            type: "string",
          },
        },
        required: ["adresse", "creation", "enseigne", "fermeture", "ouvert", "siret"],
        type: "object",
      },
      identifiant: {
        properties: {
          siret: {
            pattern: "^\\d{9,14}$",
            type: "string",
          },
          uai: {
            pattern: "^\\d{1,7}[A-Z]$",
            type: ["string", "null"],
          },
        },
        required: ["siret", "uai"],
        type: "object",
      },
      renseignements_specifiques: {
        properties: {
          numero_activite: {
            type: ["string", "null"],
          },
          qualiopi: {
            type: "boolean",
          },
        },
        required: ["numero_activite", "qualiopi"],
        type: "object",
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
      },
      unite_legale: {
        properties: {
          actif: {
            type: "boolean",
          },
          cessation: {
            format: "date-time",
            type: ["string", "null"],
          },
          creation: {
            format: "date-time",
            type: "string",
          },
          raison_sociale: {
            type: "string",
          },
          siren: {
            type: "string",
          },
        },
        required: ["actif", "cessation", "creation", "raison_sociale", "siren"],
        type: "object",
      },
    },
    required: ["etablissement", "identifiant", "renseignements_specifiques", "statut", "unite_legale"],
  },
  doc: organismeModelDoc,
  zod: zOrganisme,
};
