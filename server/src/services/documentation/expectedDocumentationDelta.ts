export type StructuredDiff = Record<
  string,
  | { type: "removed"; apiValue: unknown }
  | { type: "added"; sourceValue: unknown }
  | { type: "changed"; apiValue: unknown; sourceValue: unknown }
>;

export const expectedDocumentationDelta: Record<string, StructuredDiff> = {
  "get:/job/v1/search": {
    "parameters.longitude.schema.type": {
      type: "changed",
      apiValue: "number",
      sourceValue: ["number", "null"],
    },
    "parameters.latitude.schema.type": {
      type: "changed",
      apiValue: "number",
      sourceValue: ["number", "null"],
    },
    "parameters.radius.schema.type": {
      type: "changed",
      apiValue: "number",
      sourceValue: ["number", "null"],
    },
    "parameters.romes.schema.type": {
      type: "changed",
      apiValue: "string",
      sourceValue: ["string", "null"],
    },
    "parameters.rncp.schema.type": {
      type: "changed",
      apiValue: "string",
      sourceValue: ["string", "null"],
    },
    "responses.200.content.application/json.schema.properties.jobs.items.properties.workplace.properties.domain.properties.opco.enum":
      {
        type: "added",
        sourceValue: [
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
    "responses.200.content.application/json.schema.properties.recruiters.items.properties.workplace.properties.domain.properties.opco.enum":
      {
        type: "added",
        sourceValue: [
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
  "post:/job/v1/offer": {
    "requestBody.content.application/json.schema.properties.identifier.default": {
      type: "added",
      sourceValue: {},
    },
    "requestBody.content.application/json.schema.properties.workplace.properties.location.default": {
      type: "added",
      sourceValue: {},
    },
    "requestBody.content.application/json.schema.properties.contract.default": {
      type: "added",
      sourceValue: {},
    },
    "requestBody.content.application/json.schema.properties.offer.properties.publication.default": {
      type: "added",
      sourceValue: {},
    },
    "requestBody.content.application/json.schema.properties.offer.properties.status.default": {
      type: "added",
      sourceValue: "Active",
    },
    "responses.200.content.application/json.schema.properties.id": {
      type: "removed",
      apiValue: {
        _: "schema",
        type: "string",
      },
    },
    "responses.200.content.application/json.schema.required": {
      type: "removed",
      apiValue: ["id"],
    },
  },
  "put:/job/v1/offer/{id}": {
    "parameters.id.required": {
      type: "changed",
      apiValue: true,
      sourceValue: false,
    },
    "parameters.id.schema": {
      type: "removed",
      apiValue: {
        _: "schema",
        type: "string",
      },
    },
    "requestBody.content.application/json.schema.properties.identifier.default": {
      type: "added",
      sourceValue: {},
    },
    "requestBody.content.application/json.schema.properties.workplace.properties.location.default": {
      type: "added",
      sourceValue: {},
    },
    "requestBody.content.application/json.schema.properties.contract.default": {
      type: "added",
      sourceValue: {},
    },
    "requestBody.content.application/json.schema.properties.offer.properties.publication.default": {
      type: "added",
      sourceValue: {},
    },
    "requestBody.content.application/json.schema.properties.offer.properties.status.default": {
      type: "added",
      sourceValue: "Active",
    },
    "responses.204.content": {
      type: "added",
      sourceValue: {
        "application/json": {
          schema: {
            _: "schema",
            type: "null",
          },
        },
      },
    },
  },
};
