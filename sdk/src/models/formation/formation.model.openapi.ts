import { formationModelDoc } from "../../docs/models/formation/formation.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zFormation } from "./formation.model.js";

export const formationModelOpenapi = {
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
        type: "object",
      },
      contact: {
        properties: {
          email: {
            format: "email",
            type: ["string", "null"],
          },
          telephone: {
            type: ["string", "null"],
          },
        },
        required: ["email", "telephone"],
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
        type: "object",
      },
      formateur: {
        properties: {
          connu: {
            type: "boolean",
          },
          organisme: {
            oneOf: [
              {
                $ref: "#/components/schemas/Organisme",
              },
              { type: "null" },
            ],
          },
        },
        required: ["connu", "organisme"],
        type: "object",
      },
      identifiant: {
        properties: {
          cle_ministere_educatif: {
            type: "string",
          },
        },
        required: ["cle_ministere_educatif"],
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
            type: ["number", "null"],
          },
          siret: {
            pattern: "^\\d{9,14}$",
            type: ["string", "null"],
          },
          uai: {
            pattern: "^\\d{1,7}[A-Z]$",
            type: ["string", "null"],
          },
        },
        required: ["adresse", "geolocalisation", "precision", "siret", "uai"],
        type: "object",
      },
      modalite: {
        properties: {
          annee_cycle: {
            type: ["integer", "null"],
          },
          duree_indicative: {
            type: "number",
          },
          entierement_a_distance: {
            type: "boolean",
          },
          mef_10: {
            pattern: "^\\d{10}$",
            type: ["string", "null"],
          },
        },
        required: ["annee_cycle", "duree_indicative", "entierement_a_distance", "mef_10"],
        type: "object",
      },
      onisep: {
        properties: {
          discipline: {
            type: ["string", "null"],
          },
          domaine_sousdomaine: {
            type: ["string", "null"],
          },
          intitule: {
            type: ["string", "null"],
          },
          libelle_poursuite: {
            type: ["string", "null"],
          },
          lien_site_onisepfr: {
            type: ["string", "null"],
          },
          url: {
            format: "uri",
            type: ["string", "null"],
          },
        },
        required: ["discipline", "domaine_sousdomaine", "intitule", "libelle_poursuite", "lien_site_onisepfr", "url"],
        type: "object",
      },
      responsable: {
        properties: {
          connu: {
            type: "boolean",
          },
          organisme: {
            oneOf: [
              {
                $ref: "#/components/schemas/Organisme",
              },
              { type: "null" },
            ],
          },
        },
        required: ["connu", "organisme"],
        type: "object",
      },
      sessions: {
        items: {
          properties: {
            capacite: {
              type: ["number", "null"],
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
  },
  doc: formationModelDoc,
  zod: zFormation,
} as const satisfies OpenapiModel;
