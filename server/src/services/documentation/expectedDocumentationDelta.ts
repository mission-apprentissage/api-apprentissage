import type { StructureDiff } from "api-alternance-sdk/internal";

export const expectedDocumentationDelta: Record<string, StructureDiff<"lba", "api">> = {
  "get:/job/v1/search": {
    source: "lba",
    result: "api",
    diff: {
      "parameters.query:departements.schema.anyOf": {
        type: "removed",
        source: [
          {
            type: "string",
          },
          {
            type: "array",
            items: {
              type: "string",
            },
          },
          {
            type: "null",
          },
        ],
      },
      "parameters.query:departements.schema.type": {
        type: "added",
        result: "array",
      },
      "parameters.query:departements.schema.items": {
        type: "added",
        result: {
          type: "string",
        },
      },
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
      "parameters.query:opco.schema.type": {
        type: "changed",
        source: ["string", "null"],
        result: "string",
      },
      "parameters.query:opco.schema.enum.11": {
        type: "removed",
        source: "inconnu",
      },
      "parameters.query:opco.schema.enum.12": {
        type: "removed",
        source: "OPCO multiple",
      },
      "parameters.query:partners_to_exclude.schema.anyOf": {
        type: "removed",
        source: [
          {
            type: "string",
            enum: [
              "offres_emploi_lba",
              "recruteurs_lba",
              "Hellowork",
              "France Travail",
              "RH Alternance",
              "PASS",
              "Monster",
              "Meteojob",
              "Kelio",
              "La Poste",
              "annonces Atlas",
              "Nos Talents Nos Emplois",
              "Vite un emploi",
              "Toulouse metropole",
            ],
          },
          {
            type: "array",
            items: {
              type: "string",
              enum: [
                "offres_emploi_lba",
                "recruteurs_lba",
                "Hellowork",
                "France Travail",
                "RH Alternance",
                "PASS",
                "Monster",
                "Meteojob",
                "Kelio",
                "La Poste",
                "annonces Atlas",
                "Nos Talents Nos Emplois",
                "Vite un emploi",
                "Toulouse metropole",
              ],
            },
          },
          {
            type: "null",
          },
        ],
      },
      "parameters.query:partners_to_exclude.schema.type": {
        type: "added",
        result: "array",
      },
      "parameters.query:partners_to_exclude.schema.items": {
        type: "added",
        result: {
          type: "string",
          enum: [
            "offres_emploi_lba",
            "recruteurs_lba",
            "Hellowork",
            "France Travail",
            "RH Alternance",
            "PASS",
            "Monster",
            "Meteojob",
            "Kelio",
            "La Poste",
            "annonces Atlas",
            "Nos Talents Nos Emplois",
            "Vite un emploi",
            "Toulouse metropole",
          ],
        },
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
      "responses.200.content.application/json.schema.properties.jobs.items.properties.workplace.properties.location.properties.geopoint.properties.type.enum":
        {
          type: "removed",
          source: ["Point"],
        },
      "responses.200.content.application/json.schema.properties.jobs.items.properties.workplace.properties.location.properties.geopoint.properties.type.const":
        {
          type: "added",
          result: "Point",
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
      "responses.200.content.application/json.schema.properties.recruiters.items.properties.workplace.properties.location.properties.geopoint.properties.type.enum":
        {
          type: "removed",
          source: ["Point"],
        },
      "responses.200.content.application/json.schema.properties.recruiters.items.properties.workplace.properties.location.properties.geopoint.properties.type.const":
        {
          type: "added",
          result: "Point",
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
  "get:/job/v1/offer/{id}/publishing-informations": {
    source: "lba",
    result: "api",
    diff: {
      "parameters.path:id.schema": {
        type: "added",
        result: {
          type: "string",
        },
      },
      "responses.200.content.application/json.schema.properties.publishing.properties.error.type": {
        type: "changed",
        source: ["object", "null"],
        result: "object",
      },
    },
  },
  "get:/job/v1/export": {
    source: "lba",
    result: "api",
    diff: {
      "responses.200.content.application/json.schema.properties.lastUpdate.format": {
        type: "added",
        result: "date-time",
      },
    },
  },
};
