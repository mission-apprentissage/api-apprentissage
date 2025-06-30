import type { SchemaObject } from "openapi3-ts/oas31";

import { z } from "zod/v4-mini";
import { applicationModelDoc } from "../../docs/models/job/application.model.doc.js";
import { offerReadModelDoc } from "../../docs/models/job/offer_read.model.doc.js";
import { offerWriteModelDoc } from "../../docs/models/job/offer_write.model.doc.js";
import { recruiterModelDoc } from "../../docs/models/job/recruiter.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { pickPropertiesOpenAPI } from "../../openapi/utils/zodWithOpenApi.js";

const recruiterSchema = {
  type: "object",
  properties: {
    identifier: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
    workplace: {
      type: "object",
      properties: {
        name: {
          type: ["string", "null"],
        },
        description: {
          type: ["string", "null"],
        },
        website: {
          type: ["string", "null"],
          format: "uri",
        },
        siret: {
          type: ["string", "null"],
          pattern: "^\\d{14}$",
        },
        location: {
          type: "object",
          properties: {
            address: {
              type: "string",
            },
            geopoint: {
              $ref: "#/components/schemas/GeoJsonPoint",
            },
          },
          required: ["address", "geopoint"],
        },
        brand: {
          type: ["string", "null"],
        },
        legal_name: {
          type: ["string", "null"],
        },
        size: {
          type: ["string", "null"],
        },
        domain: {
          type: "object",
          properties: {
            idcc: {
              type: ["number", "null"],
            },
            opco: {
              type: ["string", "null"],
            },
            naf: {
              type: ["object", "null"],
              properties: {
                code: {
                  type: "string",
                },
                label: {
                  type: ["string", "null"],
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
      properties: {
        phone: {
          type: ["string", "null"],
        },
        url: {
          type: "string",
          format: "uri",
        },
        recipient_id: {
          type: ["string", "null"],
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
      type: "object",
      properties: {
        partner_job_id: {
          type: "string",
        },
        id: {
          type: ["string", "null"],
        },
        partner_label: {
          type: "string",
        },
      },
      required: ["partner_job_id", "id", "partner_label"],
    },
    workplace: recruiterSchema.properties.workplace,
    apply: recruiterSchema.properties.apply,
    contract: {
      type: "object",
      properties: {
        start: {
          type: ["string", "null"],
          format: "date-time",
        },
        duration: {
          type: ["integer", "null"],
          minimum: 0,
        },
        type: {
          type: "array",
          items: {
            type: "string",
            enum: ["Apprentissage", "Professionnalisation"],
          },
        },
        remote: {
          type: ["string", "null"],
          enum: ["onsite", "remote", "hybrid"],
        },
      },
      required: ["start", "duration", "type", "remote"],
    },
    offer: {
      type: "object",
      properties: {
        title: {
          type: "string",
          minLength: 3,
        },
        desired_skills: {
          type: "array",
          items: {
            type: "string",
          },
        },
        to_be_acquired_skills: {
          type: "array",
          items: {
            type: "string",
          },
        },
        access_conditions: {
          type: "array",
          items: {
            type: "string",
          },
        },
        opening_count: {
          type: "number",
        },
        publication: {
          type: "object",
          properties: {
            creation: {
              type: ["string", "null"],
              format: "date-time",
            },
            expiration: {
              type: ["string", "null"],
              format: "date-time",
            },
          },
          required: ["creation", "expiration"],
        },
        rome_codes: {
          type: "array",
          items: {
            type: "string",
            pattern: "^[A-Z]\\d{4}$",
          },
        },
        description: {
          type: "string",
        },
        target_diploma: {
          type: ["object", "null"],
          properties: {
            european: {
              type: "string",
              enum: ["3", "4", "5", "6", "7"],
            },
            label: {
              type: "string",
            },
          },
          required: ["european", "label"],
        },
        status: {
          type: "string",
          enum: ["Active", "Filled", "Cancelled"],
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
    workplace: {
      type: "object",
      properties: {
        ...pickPropertiesOpenAPI(offerReadSchema.properties.workplace.properties, ["name", "description", "website"]),
        siret: {
          type: "string",
          pattern: "^\\d{14}$",
        },
        location: {
          type: ["object", "null"],
          properties: {
            address: {
              type: ["string", "null"],
            },
          },
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
      properties: {
        ...pickPropertiesOpenAPI(offerReadSchema.properties.contract.properties, ["duration", "start", "remote"]),
        type: {
          ...offerReadSchema.properties.contract.properties.type,
          default: ["Apprentissage", "Professionnalisation"],
        },
      },
    },
    offer: {
      type: "object",
      properties: {
        title: offerReadSchema.properties.offer.properties.title,
        desired_skills: {
          ...offerReadSchema.properties.offer.properties.desired_skills,
          default: [],
        },
        to_be_acquired_skills: {
          ...offerReadSchema.properties.offer.properties.to_be_acquired_skills,
          default: [],
        },
        access_conditions: {
          ...offerReadSchema.properties.offer.properties.access_conditions,
          default: [],
        },
        opening_count: {
          ...offerReadSchema.properties.offer.properties.opening_count,
          default: 1,
        },
        description: {
          type: "string",
          minLength: 30,
        },
        rome_codes: {
          type: ["array", "null"],
          items: {
            type: "string",
            pattern: "^[A-Z]\\d{4}$",
          },
        },
        target_diploma: {
          type: ["object", "null"],
          properties: {
            european: {
              type: ["string", "null"],
              enum: ["3", "4", "5", "6", "7"],
            },
          },
        },
        publication: {
          type: "object",
          properties: pickPropertiesOpenAPI(offerReadSchema.properties.offer.properties.publication.properties, [
            "creation",
            "expiration",
          ]),
        },
        multicast: {
          type: "boolean",
          description: "Si l'offre peut être diffusé sur l'ensemble des plateformes partenaires",
          default: true,
        },
        origin: {
          type: ["string", "null"],
          description: "Origine de l'offre provenant d'un aggregateur",
        },
        status: {
          ...offerReadSchema.properties.offer.properties.status,
          default: "Active",
        },
      },
      required: ["title", "description"],
    },
  },
  required: ["workplace", "apply", "offer"],
} as const satisfies SchemaObject;

const applicationWriteSchema = {
  type: "object",
  properties: {
    applicant_first_name: {
      type: "string",
      minLength: 1,
      maxLength: 50,
    },
    applicant_last_name: {
      type: "string",
      minLength: 1,
      maxLength: 50,
    },
    applicant_email: {
      type: "string",
      format: "email",
    },
    applicant_phone: {
      type: "string",
    },
    applicant_attachment_name: {
      type: "string",
      minLength: 1,
      pattern: "((.*?))(\\.)+([Dd][Oo][Cc][Xx]|[Pp][Dd][Ff])$",
    },
    applicant_message: {
      type: ["string", "null"],
    },
    applicant_attachment_content: {
      type: "string",
      maxLength: 4215276,
      format: "byte",
    },
    recipient_id: {
      type: "string",
      description:
        "Identifiant unique de la ressource vers laquelle la candidature est faite, préfixé par le nom de la collection",
    },
  },
  required: [
    "applicant_first_name",
    "applicant_last_name",
    "applicant_email",
    "applicant_phone",
    "applicant_attachment_name",
    "applicant_attachment_content",
    "recipient_id",
  ],
  additionalProperties: false,
} as const satisfies SchemaObject;

export const recruiterModelOpenapi: OpenapiModel<"JobRecruiter"> = {
  name: "JobRecruiter",
  schema: recruiterSchema,
  doc: recruiterModelDoc,
  zod: z.unknown(),
};

export const offerReadModelOpenapi: OpenapiModel<"JobOfferRead"> = {
  name: "JobOfferRead",
  schema: offerReadSchema,
  doc: offerReadModelDoc,
  zod: z.unknown(),
};

export const offerWriteModelOpenapi: OpenapiModel<"JobOfferWrite"> = {
  name: "JobOfferWrite",
  schema: offerWriteSchema,
  doc: offerWriteModelDoc,
  zod: z.unknown(),
};

export const applicationWriteModelOpenapi: OpenapiModel<"JobApplicationWrite"> = {
  name: "JobApplicationWrite",
  schema: applicationWriteSchema,
  doc: applicationModelDoc,
  zod: z.unknown(),
};
