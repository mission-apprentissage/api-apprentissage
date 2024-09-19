import type { OpenApiBuilder, SchemaObject } from "openapi3-ts/oas31";

import { recruiterModelDoc } from "../../docs/models/job/01_recruiter/recruiter.model.doc.js";
import { offerReadModelDoc } from "../../docs/models/job/02_offer_read/offer_read.model.doc.js";
import { offerWriteModelDoc } from "../../docs/models/job/03_offer_write/offer_read.model.doc.js";
import { getDocOpenAPIAttributes, pickPropertiesOpenAPI } from "../../utils/zodWithOpenApi.js";

const recruiterSchema = {
  type: "object",
  properties: {
    identifier: {
      ...getDocOpenAPIAttributes(recruiterModelDoc.sections[0].fields["identifier"]),
      type: "object",
      properties: {
        id: {
          type: "string",
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[0].fields["identifier.id"]),
        },
      },
      required: ["id"],
    },
    workplace: {
      type: "object",
      ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace"]),
      properties: {
        name: {
          type: ["string", "null"],
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.name"]),
        },
        description: {
          type: ["string", "null"],
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.name"]),
        },
        website: {
          type: ["string", "null"],
          format: "uri",
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.name"]),
        },
        siret: {
          type: ["string", "null"],
          pattern: "^\\d{9,14}$",
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.name"]),
        },
        location: {
          type: "object",
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.location"]),
          properties: {
            address: {
              type: "string",
              ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.location.address"]),
            },
            geopoint: {
              type: "object",
              ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.location.geopoint"]),
              properties: {
                coordinates: {
                  type: "array",
                  ...getDocOpenAPIAttributes(
                    recruiterModelDoc.sections[1].fields["workplace.location.geopoint.coordinates"]
                  ),
                  prefixItems: [
                    {
                      type: "number",
                      ...getDocOpenAPIAttributes(
                        recruiterModelDoc.sections[1].fields["workplace.location.geopoint.coordinates[0]"]
                      ),
                      minimum: -180,
                      maximum: 180,
                    },
                    {
                      type: "number",
                      ...getDocOpenAPIAttributes(
                        recruiterModelDoc.sections[1].fields["workplace.location.geopoint.coordinates[1]"]
                      ),
                      minimum: -90,
                      maximum: 90,
                    },
                  ],
                },
                type: {
                  type: "string",
                  ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.location.geopoint.type"]),
                  enum: ["Point"],
                },
              },
              required: ["coordinates", "type"],
            },
          },
          required: ["address", "geopoint"],
        },
        brand: {
          type: ["string", "null"],
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.brand"]),
        },
        legal_name: {
          type: ["string", "null"],
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.legal_name"]),
        },
        size: {
          type: ["string", "null"],
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.size"]),
        },
        domain: {
          type: "object",
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.domain"]),
          properties: {
            idcc: {
              type: ["number", "null"],
              ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.domain.idcc"]),
            },
            opco: {
              type: ["string", "null"],
              ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.domain.opco"]),
            },
            naf: {
              type: ["object", "null"],
              ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.domain.naf"]),
              properties: {
                code: {
                  type: "string",
                  ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.domain.naf.code"]),
                },
                label: {
                  type: ["string", "null"],

                  ...getDocOpenAPIAttributes(recruiterModelDoc.sections[1].fields["workplace.domain.naf.label"]),
                },
              },
              required: ["code", "label"],
            },
          },
          required: ["idcc", "opco", "naf"],
        },
      },
      required: ["name", "description", "website", "siret", "location", "brand", "legal_name", "size", "domain"],
    },
    apply: {
      type: "object",
      ...getDocOpenAPIAttributes(recruiterModelDoc.sections[2].fields["apply"]),
      properties: {
        phone: {
          type: ["string", "null"],
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[2].fields["apply.phone"]),
        },
        url: {
          type: "string",
          format: "uri",
          ...getDocOpenAPIAttributes(recruiterModelDoc.sections[2].fields["apply.url"]),
        },
      },
      required: ["phone", "url"],
    },
  },
  required: ["identifier", "workplace", "apply"],
} as const satisfies SchemaObject;

const offerReadSchema = {
  type: "object",
  properties: {
    identifier: {
      ...getDocOpenAPIAttributes(offerReadModelDoc.sections[0].fields["identifier"]),
      type: "object",
      properties: {
        partner_job_id: {
          type: ["string", "null"],
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[0].fields["identifier.job_partner_id"]),
        },
        id: {
          type: ["string", "null"],
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[0].fields["identifier.id"]),
        },
        partner_label: {
          type: "string",
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[0].fields["identifier.partner_label"]),
        },
      },
      required: ["partner_job_id", "id", "partner_label"],
    },
    workplace: recruiterSchema.properties.workplace,
    apply: recruiterSchema.properties.apply,
    contract: {
      type: "object",
      ...getDocOpenAPIAttributes(offerReadModelDoc.sections[1].fields["contract"]),
      properties: {
        start: {
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[1].fields["contract.start"]),
          type: ["string", "null"],
          format: "date-time",
        },
        duration: {
          type: ["number", "null"],
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[1].fields["contract.duration"]),
        },
        type: {
          type: "array",
          items: {
            type: "string",
            enum: ["Apprentissage", "Professionnalisation"],
          },
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[1].fields["contract.type"]),
        },
        remote: {
          type: ["string", "null"],
          enum: ["onsite", "remote", "hybrid"],
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[1].fields["contract.remote"]),
        },
      },
      required: ["start", "duration", "type", "remote"],
    },
    offer: {
      type: "object",
      ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer"]),
      properties: {
        title: {
          type: "string",
          minLength: 3,
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.title"]),
        },
        desired_skills: {
          type: "array",
          items: {
            type: "string",
            ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.desired_skills[]"]),
          },
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.desired_skills"]),
        },
        to_be_acquired_skills: {
          type: "array",
          items: {
            type: "string",
            ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.to_be_acquired_skills[]"]),
          },
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.to_be_acquired_skills"]),
        },
        access_conditions: {
          type: "array",
          items: {
            type: "string",
            ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.access_conditions[]"]),
          },
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.access_conditions"]),
        },
        opening_count: {
          type: "number",
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.opening_count"]),
        },
        publication: {
          type: "object",
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.publication"]),
          properties: {
            creation: {
              type: ["string", "null"],
              format: "date-time",
              ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.publication.creation"]),
            },
            expiration: {
              type: ["string", "null"],
              format: "date-time",
              ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.publication.expiration"]),
            },
          },
          required: ["creation", "expiration"],
        },
        rome_codes: {
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.rome_codes"]),
          type: "array",
          items: {
            type: "string",
            pattern: "^[A-Z]{1}\\d{4}$",
            ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.rome_codes[]"]),
          },
        },
        description: {
          type: "string",
          minLength: 30,
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.description"]),
        },
        target_diploma: {
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.target_diploma"]),
          type: ["object", "null"],
          properties: {
            european: {
              ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.target_diploma.european"]),
              type: "string",
              enum: ["3", "4", "5", "6", "7"],
            },
            label: {
              ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.target_diploma.label"]),
              type: "string",
            },
          },
          required: ["european", "label"],
        },
        status: {
          ...getDocOpenAPIAttributes(offerReadModelDoc.sections[2].fields["offer.status"]),
          type: "string",
          enum: ["Active", "Filled", "Cancelled", "Pending"],
        },
      },
      required: [
        "title",
        "desired_skills",
        "to_be_acquired_skills",
        "access_conditions",
        "opening_count",
        "publication",
        "rome_codes",
        "description",
        "target_diploma",
        "status",
      ],
    },
  },
  required: ["identifier", "workplace", "apply", "contract", "offer"],
} as const satisfies SchemaObject;

const offerWriteSchema = {
  type: "object",
  properties: {
    identifier: {
      type: "object",
      properties: pickPropertiesOpenAPI(offerReadSchema.properties.identifier.properties, ["partner_job_id"]),
    },
    workplace: {
      type: "object",
      properties: {
        ...pickPropertiesOpenAPI(offerReadSchema.properties.workplace.properties, ["name", "description", "website"]),
        siret: {
          type: "string",
          pattern: "^\\d{9,14}$",
          ...getDocOpenAPIAttributes(offerWriteModelDoc.sections[3].fields["workplace.siret"]),
        },
        location: {
          type: ["object", "null"],
          ...getDocOpenAPIAttributes(offerWriteModelDoc.sections[3].fields["workplace.location"]),
          properties: {
            address: {
              type: "string",
              ...getDocOpenAPIAttributes(offerWriteModelDoc.sections[3].fields["workplace.location.address"]),
            },
          },
          required: ["address"],
        },
      },
      required: ["siret"],
    },
    apply: {
      type: "object",
      properties: {
        email: {
          type: ["string", "null"],
          format: "email",
          description: "Email de contact",
        },
        url: {
          type: ["string", "null"],
          format: "uri",
          description: "URL pour candidater",
        },
        phone: {
          type: ["string", "null"],
          description: "Téléphone de contact",
        },
      },
    },
    contract: {
      type: "object",
      properties: pickPropertiesOpenAPI(offerReadSchema.properties.contract.properties, [
        "start",
        "duration",
        "type",
        "remote",
      ]),
    },
    offer: {
      type: "object",
      properties: {
        ...pickPropertiesOpenAPI(offerReadSchema.properties.offer.properties, [
          "title",
          "desired_skills",
          "to_be_acquired_skills",
          "access_conditions",
          "opening_count",
        ]),
        description: {
          type: "string",
          minLength: 30,
          ...getDocOpenAPIAttributes(offerWriteModelDoc.sections[2].fields["offer.description"]),
        },
        rome_codes: {
          type: "array",
          items: {
            type: "string",
            pattern: "^[A-Z]{1}\\d{4}$",
            ...getDocOpenAPIAttributes(offerWriteModelDoc.sections[2].fields["offer.rome_codes[]"]),
          },
          ...getDocOpenAPIAttributes(offerWriteModelDoc.sections[2].fields["offer.rome_codes"]),
        },
        target_diploma: {
          ...getDocOpenAPIAttributes(offerWriteModelDoc.sections[2].fields["offer.target_diploma"]),
          type: ["object", "null"],
          properties: {
            european: {
              ...getDocOpenAPIAttributes(offerWriteModelDoc.sections[2].fields["offer.target_diploma.european"]),
              type: "string",
              enum: ["3", "4", "5", "6", "7"],
            },
          },
          required: ["european"],
        },
        publication: {
          ...getDocOpenAPIAttributes(offerWriteModelDoc.sections[2].fields["offer.publication"]),
          type: "object",
          properties: pickPropertiesOpenAPI(offerReadSchema.properties.offer.properties.publication.properties, [
            "creation",
            "expiration",
          ]),
        },
        multicast: {
          type: "boolean",
          description: "Si l'offre peut être diffusé sur l'ensemble des plateformes partenaires",
        },
        origin: {
          type: ["string", "null"],
          description: "Origine de l'offre provenant d'un aggregateur",
        },
      },
      required: ["title", "description"],
    },
  },
  required: ["workplace", "apply", "offer"],
} as const satisfies SchemaObject;

export function registerOpenApiJobModel(builder: OpenApiBuilder): OpenApiBuilder {
  return builder
    .addSchema("JobRecruiter", recruiterSchema)
    .addSchema("JobOfferRead", offerReadSchema)
    .addSchema("JobOfferWrite", offerWriteSchema);
}
