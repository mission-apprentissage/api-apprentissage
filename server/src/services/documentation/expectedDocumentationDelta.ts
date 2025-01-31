import type { StructureDiff } from "api-alternance-sdk/internal";

export const expectedDocumentationDelta: Record<string, StructureDiff<"lba", "api">> = {
  "get:/job/v1/search": {
    source: "lba",
    result: "api",
    diff: {
      "parameters.query:latitude.schema.type": {
        type: "changed",
        source: ["number", "null"],
        result: "number",
      },
      "parameters.query:longitude.schema.type": {
        type: "changed",
        source: ["number", "null"],
        result: "number",
      },
      "parameters.query:partners_to_exclude.schema.type": {
        type: "changed",
        source: ["array", "null"],
        result: "array",
      },
      "parameters.query:partners_to_exclude.schema.items.enum": {
        type: "removed",
        source: ["Hellowork", "RH Alternance"],
      },
      "parameters.query:radius.schema.type": {
        type: "changed",
        source: ["number", "null"],
        result: "number",
      },
      "parameters.query:rncp.schema.type": {
        type: "changed",
        source: ["string", "null"],
        result: "string",
      },
      "parameters.query:romes.schema.type": {
        type: "changed",
        source: ["string", "null"],
        result: "string",
      },
      "responses.200.content.application/json.schema.properties.jobs.items.properties.workplace.properties.location.properties.geopoint.properties.coordinates.maxItems":
        {
          type: "added",
          result: 2,
        },
      "responses.200.content.application/json.schema.properties.jobs.items.properties.workplace.properties.location.properties.geopoint.properties.coordinates.minItems":
        {
          type: "added",
          result: 2,
        },
      "responses.200.content.application/json.schema.properties.jobs.items.properties.workplace.properties.domain.properties.opco.enum":
        {
          type: "removed",
          source: [
            "AFDAS",
            "AKTO / Opco entreprises et salariés des services à forte intensité de main d'oeuvre",
            "ATLAS",
            "Constructys",
            "L'Opcommerce",
            "OCAPIAT",
            "OPCO 2i",
            "Opco entreprises de proximité",
            "Opco Mobilités",
            "Opco Santé",
            "Uniformation, l'Opco de la Cohésion sociale",
            "inconnu",
            "OPCO multiple",
          ],
        },
      "responses.200.content.application/json.schema.properties.recruiters.items.properties.identifier.properties.id": {
        type: "added",
        result: {
          type: "string",
        },
      },
      "responses.200.content.application/json.schema.properties.recruiters.items.properties.workplace.properties.location.properties.geopoint.properties.coordinates.maxItems":
        {
          type: "added",
          result: 2,
        },
      "responses.200.content.application/json.schema.properties.recruiters.items.properties.workplace.properties.location.properties.geopoint.properties.coordinates.minItems":
        {
          type: "added",
          result: 2,
        },
      "responses.200.content.application/json.schema.properties.recruiters.items.properties.workplace.properties.domain.properties.opco.enum":
        {
          type: "removed",
          source: [
            "AFDAS",
            "AKTO / Opco entreprises et salariés des services à forte intensité de main d'oeuvre",
            "ATLAS",
            "Constructys",
            "L'Opcommerce",
            "OCAPIAT",
            "OPCO 2i",
            "Opco entreprises de proximité",
            "Opco Mobilités",
            "Opco Santé",
            "Uniformation, l'Opco de la Cohésion sociale",
            "inconnu",
            "OPCO multiple",
          ],
        },
    },
  },
  "post:/job/v1/offer": {
    source: "lba",
    result: "api",
    diff: {
      "requestBody.content.application/json.schema.properties.contract.default": {
        type: "removed",
        source: {},
      },
      "requestBody.content.application/json.schema.properties.offer.properties.publication.default": {
        type: "removed",
        source: {},
      },
      "requestBody.content.application/json.schema.properties.workplace.properties.location.default": {
        type: "removed",
        source: {},
      },
      "responses.200.content.application/json.schema.properties.id": {
        type: "added",
        result: {
          type: "string",
        },
      },
    },
  },
  "put:/job/v1/offer/{id}": {
    source: "lba",
    result: "api",
    diff: {
      "parameters.path:id.schema": {
        type: "added",
        result: {
          type: "string",
        },
      },
      "requestBody.content.application/json.schema.properties.contract.default": {
        type: "removed",
        source: {},
      },
      "requestBody.content.application/json.schema.properties.offer.properties.publication.default": {
        type: "removed",
        source: {},
      },
      "requestBody.content.application/json.schema.properties.workplace.properties.location.default": {
        type: "removed",
        source: {},
      },
      "responses.204.content": {
        type: "removed",
        source: {
          "application/json": {
            schema: {
              type: "null",
            },
          },
        },
      },
    },
  },
  "post:/job/v1/apply": {
    source: "lba",
    result: "api",
    diff: {
      "requestBody.content.application/json.schema.properties.applicant_attachment_content.format": {
        type: "added",
        result: "byte",
      },
    },
  },
  "post:/formation/v1/appointment/generate-link": {
    source: "lba",
    result: "api",
    diff: {
      "requestBody.content.application/json.schema.anyOf": {
        type: "removed",
        source: [
          {
            type: "object",
            additionalProperties: false,
            required: ["parcoursup_id"],
            properties: {
              parcoursup_id: {
                type: "string",
              },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["onisep_id"],
            properties: {
              onisep_id: {
                type: "string",
              },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["cle_ministere_educatif"],
            properties: {
              cle_ministere_educatif: {
                type: "string",
              },
            },
          },
        ],
      },
      "requestBody.content.application/json.schema.oneOf": {
        type: "added",
        result: [
          {
            type: "object",
            additionalProperties: false,
            required: ["parcoursup_id"],
            properties: {
              parcoursup_id: {
                type: "string",
              },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["onisep_id"],
            properties: {
              onisep_id: {
                type: "string",
              },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["cle_ministere_educatif"],
            properties: {
              cle_ministere_educatif: {
                type: "string",
              },
            },
          },
        ],
      },
      "responses.200.content.application/json.schema.anyOf": {
        type: "removed",
        source: [
          {
            type: "object",
            additionalProperties: false,
            required: [
              "cfd",
              "cle_ministere_educatif",
              "code_postal",
              "etablissement_formateur_entreprise_raison_sociale",
              "etablissement_formateur_siret",
              "form_url",
              "intitule_long",
              "lieu_formation_adresse",
              "localite",
            ],
            properties: {
              etablissement_formateur_entreprise_raison_sociale: {
                type: ["string", "null"],
              },
              intitule_long: {
                type: "string",
              },
              lieu_formation_adresse: {
                type: "string",
              },
              code_postal: {
                type: "string",
              },
              etablissement_formateur_siret: {
                type: ["string", "null"],
                pattern: "^\\d{14}$",
              },
              cfd: {
                type: "string",
              },
              localite: {
                type: "string",
              },
              cle_ministere_educatif: {
                type: "string",
              },
              form_url: {
                type: "string",
              },
            },
          },
          {
            type: "object",
            required: ["error"],
            properties: {
              error: {
                type: "string",
                enum: ["Appointment request not available"],
              },
            },
          },
        ],
      },
      "responses.200.content.application/json.schema.oneOf": {
        type: "added",
        result: [
          {
            type: "object",
            additionalProperties: false,
            required: [
              "cfd",
              "cle_ministere_educatif",
              "code_postal",
              "etablissement_formateur_entreprise_raison_sociale",
              "etablissement_formateur_siret",
              "form_url",
              "intitule_long",
              "lieu_formation_adresse",
              "localite",
            ],
            properties: {
              etablissement_formateur_entreprise_raison_sociale: {
                type: ["string", "null"],
              },
              intitule_long: {
                type: "string",
              },
              lieu_formation_adresse: {
                type: "string",
              },
              code_postal: {
                type: "string",
              },
              etablissement_formateur_siret: {
                type: ["string", "null"],
                pattern: "^\\d{14}$",
              },
              cfd: {
                type: "string",
              },
              localite: {
                type: "string",
              },
              cle_ministere_educatif: {
                type: "string",
              },
              form_url: {
                type: "string",
              },
            },
          },
          {
            type: "object",
            required: ["error"],
            properties: {
              error: {
                type: "string",
                enum: ["Appointment request not available"],
              },
            },
          },
        ],
      },
    },
  },
};
