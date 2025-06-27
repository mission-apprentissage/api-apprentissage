import { formationModelDoc } from "../../docs/models/formation/formation.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zFormation } from "./formation.model.js";

export const formationModelOpenapi: OpenapiModel<"Formation"> = {
  name: "Formation",
  schema: {
    type: "object",
    properties: {
      certification: {
        properties: {
          connue: {
            type: "boolean",
          },
          valeur: {
            $ref: "#/components/schemas/Certification",
          },
        },
        required: ["connue", "valeur"],
        additionalProperties: false,
        type: "object",
      },
      contact: {
        properties: {
          email: {
            anyOf: [
              {
                format: "email",
                type: "string",
                pattern:
                  "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
              },
              { type: "null" },
            ],
          },
          telephone: {
            anyOf: [
              {
                type: "string",
              },
              { type: "null" },
            ],
          },
        },
        required: ["email", "telephone"],
        additionalProperties: false,
        type: "object",
      },
      contenu_educatif: {
        properties: {
          contenu: {
            type: "string",
          },
          objectif: {
            type: "string",
          },
        },
        required: ["contenu", "objectif"],
        additionalProperties: false,
        type: "object",
      },
      formateur: {
        properties: {
          connu: {
            type: "boolean",
          },
          organisme: {
            anyOf: [
              {
                $ref: "#/components/schemas/Organisme",
              },
              { type: "null" },
            ],
          },
        },
        required: ["connu", "organisme"],
        additionalProperties: false,
        type: "object",
      },
      identifiant: {
        properties: {
          cle_ministere_educatif: {
            type: "string",
          },
        },
        required: ["cle_ministere_educatif"],
        additionalProperties: false,
        type: "object",
      },
      lieu: {
        properties: {
          adresse: {
            $ref: "#/components/schemas/Adresse",
          },
          geolocalisation: {
            $ref: "#/components/schemas/GeoJsonPoint",
          },
          precision: {
            anyOf: [{ type: "number" }, { type: "null" }],
          },
          siret: {
            anyOf: [{ type: "string", pattern: "^\\d{14}$" }, { type: "null" }],
          },
          uai: {
            anyOf: [{ type: "string", pattern: "^\\d{7}[A-Z]$" }, { type: "null" }],
          },
        },
        required: ["adresse", "geolocalisation", "precision", "siret", "uai"],
        additionalProperties: false,
        type: "object",
      },
      modalite: {
        properties: {
          annee_cycle: {
            anyOf: [{ type: "integer" }, { type: "null" }],
          },
          duree_indicative: {
            type: "number",
          },
          entierement_a_distance: {
            type: "boolean",
          },
          mef_10: {
            anyOf: [{ type: "string", pattern: "^\\d{10}$" }, { type: "null" }],
          },
        },
        required: ["annee_cycle", "duree_indicative", "entierement_a_distance", "mef_10"],
        additionalProperties: false,
        type: "object",
      },
      onisep: {
        properties: {
          discipline: {
            anyOf: [{ type: "string" }, { type: "null" }],
          },
          domaine_sousdomaine: {
            anyOf: [{ type: "string" }, { type: "null" }],
          },
          intitule: {
            anyOf: [{ type: "string" }, { type: "null" }],
          },
          libelle_poursuite: {
            anyOf: [{ type: "string" }, { type: "null" }],
          },
          lien_site_onisepfr: {
            anyOf: [{ type: "string" }, { type: "null" }],
          },
          url: {
            anyOf: [{ type: "string", format: "uri" }, { type: "null" }],
          },
        },
        required: ["discipline", "domaine_sousdomaine", "intitule", "libelle_poursuite", "lien_site_onisepfr", "url"],
        additionalProperties: false,
        type: "object",
      },
      responsable: {
        properties: {
          connu: {
            type: "boolean",
          },
          organisme: {
            anyOf: [
              {
                $ref: "#/components/schemas/Organisme",
              },
              { type: "null" },
            ],
          },
        },
        required: ["connu", "organisme"],
        additionalProperties: false,
        type: "object",
      },
      sessions: {
        items: {
          properties: {
            capacite: {
              anyOf: [{ type: "number" }, { type: "null" }],
            },
            debut: {
              format: "date-time",
              type: "string",
            },
            fin: {
              format: "date-time",
              type: "string",
            },
          },
          required: ["capacite", "debut", "fin"],
          additionalProperties: false,
          type: "object",
        },
        type: "array",
      },
      statut: {
        properties: {
          catalogue: {
            enum: ["publié", "supprimé", "archivé"],
            type: "string",
          },
        },
        required: ["catalogue"],
        additionalProperties: false,
        type: "object",
      },
    },
    required: [
      "certification",
      "contact",
      "contenu_educatif",
      "formateur",
      "identifiant",
      "lieu",
      "modalite",
      "onisep",
      "responsable",
      "sessions",
      "statut",
    ],
    additionalProperties: false,
  },
  doc: formationModelDoc,
  zod: zFormation,
};
