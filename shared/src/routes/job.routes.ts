import { zApiJobRoutes } from "api-alternance-sdk";
import type { OpenApiBuilder, ResponsesObject } from "openapi3-ts/oas31";

import type { IRoutesDef } from "./common.routes.js";

export const zJobRoutes = {
  get: {
    "/job/v1/search": {
      ...zApiJobRoutes.get["/job/v1/search"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
  post: {
    "/job/v1/offer": {
      ...zApiJobRoutes.post["/job/v1/offer"],
      securityScheme: {
        auth: "api-key",
        access: "jobs:write",
        ressources: {},
      },
    },
  },
  put: {
    "/job/v1/offer/:id": {
      ...zApiJobRoutes.put["/job/v1/offer/:id"],
      securityScheme: {
        auth: "api-key",
        access: "jobs:write",
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;

export function registerJobRoutes(builder: OpenApiBuilder, errorResponses: ResponsesObject): OpenApiBuilder {
  return builder
    .addPath("/job/v1/search", {
      get: {
        tags: ["Job"],
        summary: "Opportunités d’emploi en alternance",
        description:
          "Accédez en temps réel à l'ensemble des opportunités d'emploi en alternance disponibles sur le territoire français et exposez les gratuitement et en marque blanche auprès de vos utilisateurs.",
        operationId: "searchJobs",
        security: [{ "api-key": [] }],
        parameters: [
          {
            schema: {
              type: ["number", "null"],
              minimum: -180,
              maximum: 180,
            },
            required: false,
            name: "longitude",
            in: "query",
          },
          {
            schema: {
              type: ["number", "null"],
              minimum: -90,
              maximum: 90,
            },
            required: false,
            name: "latitude",
            in: "query",
          },
          {
            schema: {
              type: ["number", "null"],
              minimum: 0,
              maximum: 200,
              default: 30,
            },
            required: false,
            name: "radius",
            in: "query",
          },
          {
            schema: { type: "string", enum: ["3", "4", "5", "6", "7"] },
            required: false,
            name: "target_diploma_level",
            in: "query",
          },
          {
            schema: { type: "string" },
            required: false,
            name: "romes",
            in: "query",
          },
          {
            schema: { type: "string", pattern: "^RNCP\\d{3,5}$" },
            required: false,
            name: "rncp",
            in: "query",
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jobs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          identifier: {
                            type: "object",
                            properties: {
                              partner_job_id: { type: ["string", "null"] },
                              id: { type: ["string", "null"] },
                              partner_label: { type: "string" },
                            },
                            required: ["partner_job_id", "id", "partner_label"],
                          },
                          workplace: {
                            type: "object",
                            properties: {
                              name: {
                                type: ["string", "null"],
                                description: "Nom customisé de l'entreprise",
                              },
                              description: {
                                type: ["string", "null"],
                                description: "description de l'entreprise",
                              },
                              website: {
                                type: ["string", "null"],
                                format: "uri",
                                description: "Site web de l'entreprise",
                              },
                              siret: {
                                type: ["string", "null"],
                                pattern: "^\\d{9,14}$",
                                description: "Siret de l'entreprise",
                                examples: ["13002526500013"],
                              },
                              address: {
                                type: "object",
                                properties: {
                                  label: {
                                    type: "string",
                                    description: "Adresse de l'offre, provenant du SIRET ou du partenaire",
                                  },
                                },
                                required: ["label"],
                              },
                              brand: {
                                type: ["string", "null"],
                                description: "Nom d'enseigne de l'établissement",
                              },
                              legal_name: {
                                type: ["string", "null"],
                                description: "Nom légal de l'entreprise",
                              },
                              size: {
                                type: ["string", "null"],
                                description: "Taille de l'entreprise",
                              },
                              geopoint: {
                                type: "object",
                                properties: {
                                  coordinates: {
                                    type: "array",
                                    prefixItems: [
                                      {
                                        type: "number",
                                        minimum: -180,
                                        maximum: 180,
                                        description: "Longitude",
                                      },
                                      {
                                        type: "number",
                                        minimum: -90,
                                        maximum: 90,
                                        description: "Latitude",
                                      },
                                    ],
                                  },
                                  type: {
                                    type: "string",
                                    enum: ["Point"],
                                  },
                                },
                                required: ["coordinates", "type"],
                                description: "Geolocalisation de l'offre",
                              },
                              idcc: {
                                type: ["number", "null"],
                                description: "Identifiant convention collective",
                              },
                              opco: {
                                type: ["string", "null"],
                                description: "Nom de l'OPCO",
                              },
                              naf: {
                                type: ["object", "null"],
                                properties: {
                                  code: {
                                    type: "string",
                                    description: "code NAF",
                                  },
                                  label: {
                                    type: ["string", "null"],
                                    description: "Libelle NAF",
                                  },
                                },
                                required: ["code", "label"],
                              },
                            },
                            required: [
                              "name",
                              "description",
                              "website",
                              "siret",
                              "address",
                              "brand",
                              "legal_name",
                              "size",
                              "geopoint",
                              "idcc",
                              "opco",
                              "naf",
                            ],
                          },
                          apply: {
                            type: "object",
                            properties: {
                              phone: {
                                type: ["string", "null"],
                                description: "Téléphone de contact",
                              },
                              url: {
                                type: "string",
                                format: "uri",
                                description: "URL pour candidater",
                              },
                            },
                            required: ["phone", "url"],
                          },
                          contract: {
                            type: "object",
                            properties: {
                              start: {
                                anyOf: [
                                  { type: "string", format: "date-time" },
                                  { type: "string" },
                                  { type: "string" },
                                  { type: "null" },
                                ],
                                description: "Date de début du contrat",
                                format: "date-time",
                              },
                              duration: {
                                type: ["number", "null"],
                                description: "Durée du contrat en mois",
                              },
                              type: {
                                type: "array",
                                items: {
                                  type: "string",
                                  enum: ["Apprentissage", "Professionnalisation"],
                                },
                                description: "Type de contrat",
                              },
                              remote: {
                                type: ["string", "null"],
                                enum: ["onsite", "remote", "hybrid"],
                                description: "Format de travail de l'offre",
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
                                description: "Titre de l'offre",
                              },
                              desired_skills: {
                                type: "array",
                                items: { type: "string" },
                                description: "Compétence attendues par le candidat pour l'offre",
                              },
                              to_be_acquired_skills: {
                                type: "array",
                                items: { type: "string" },
                                description: "Compétence acuqises durant l'alternance",
                              },
                              access_conditions: {
                                type: "array",
                                items: { type: "string" },
                                description: "Conditions d'accès à l'offre",
                              },
                              opening_count: {
                                type: "number",
                                description: "Nombre de poste disponible",
                              },
                              creation: {
                                anyOf: [
                                  { type: "string", format: "date-time" },
                                  { type: "string" },
                                  { type: "string" },
                                  { type: "null" },
                                ],
                                description: "Date de creation de l'offre",
                                format: "date-time",
                              },
                              expiration: {
                                anyOf: [
                                  { type: "string", format: "date-time" },
                                  { type: "string" },
                                  { type: "string" },
                                  { type: "null" },
                                ],
                                description:
                                  "Date d'expiration de l'offre. Si pas présente, mettre à creation_date + 60j",
                                format: "date-time",
                              },
                              rome_codes: {
                                type: "array",
                                items: {
                                  type: "string",
                                  pattern: "^[A-Z]{1}\\d{4}$",
                                  example: "D1102",
                                },
                              },
                              description: {
                                type: "string",
                                minLength: 30,
                                description:
                                  "description de l'offre, soit définit par le partenaire, soit celle du ROME si pas suffisament grande",
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
                                    description: "Libellé du niveau de diplome",
                                  },
                                },
                                required: ["european", "label"],
                              },
                              status: {
                                type: "string",
                                enum: ["Active", "Filled", "Cancelled", "Pending"],
                                description: "Status de l'offre (surtout utilisé pour les offres ajouté par API)",
                              },
                            },
                            required: [
                              "title",
                              "desired_skills",
                              "to_be_acquired_skills",
                              "access_conditions",
                              "opening_count",
                              "creation",
                              "expiration",
                              "rome_codes",
                              "description",
                              "target_diploma",
                              "status",
                            ],
                          },
                        },
                        required: ["identifier", "workplace", "apply", "contract", "offer"],
                      },
                    },
                    recruiters: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          identifier: {
                            type: "object",
                            properties: { id: { type: "string" } },
                            required: ["id"],
                          },
                          workplace: {
                            type: "object",
                            properties: {
                              name: {
                                type: ["string", "null"],
                                description: "Nom customisé de l'entreprise",
                              },
                              description: {
                                type: ["string", "null"],
                                description: "description de l'entreprise",
                              },
                              website: {
                                type: ["string", "null"],
                                format: "uri",
                                description: "Site web de l'entreprise",
                              },
                              siret: {
                                type: ["string", "null"],
                                pattern: "^\\d{9,14}$",
                                description: "Siret de l'entreprise",
                                examples: ["13002526500013"],
                              },
                              address: {
                                type: "object",
                                properties: {
                                  label: {
                                    type: "string",
                                    description: "Adresse de l'offre, provenant du SIRET ou du partenaire",
                                  },
                                },
                                required: ["label"],
                              },
                              brand: {
                                type: ["string", "null"],
                                description: "Nom d'enseigne de l'établissement",
                              },
                              legal_name: {
                                type: ["string", "null"],
                                description: "Nom légal de l'entreprise",
                              },
                              size: {
                                type: ["string", "null"],
                                description: "Taille de l'entreprise",
                              },
                              geopoint: {
                                type: "object",
                                properties: {
                                  coordinates: {
                                    type: "array",
                                    prefixItems: [
                                      {
                                        type: "number",
                                        minimum: -180,
                                        maximum: 180,
                                        description: "Longitude",
                                      },
                                      {
                                        type: "number",
                                        minimum: -90,
                                        maximum: 90,
                                        description: "Latitude",
                                      },
                                    ],
                                  },
                                  type: {
                                    type: "string",
                                    enum: ["Point"],
                                  },
                                },
                                required: ["coordinates", "type"],
                                description: "Geolocalisation de l'offre",
                              },
                              idcc: {
                                type: ["number", "null"],
                                description: "Identifiant convention collective",
                              },
                              opco: {
                                type: ["string", "null"],
                                description: "Nom de l'OPCO",
                              },
                              naf: {
                                type: ["object", "null"],
                                properties: {
                                  code: {
                                    type: "string",
                                    description: "code NAF",
                                  },
                                  label: {
                                    type: ["string", "null"],
                                    description: "Libelle NAF",
                                  },
                                },
                                required: ["code", "label"],
                              },
                            },
                            required: [
                              "name",
                              "description",
                              "website",
                              "siret",
                              "address",
                              "brand",
                              "legal_name",
                              "size",
                              "geopoint",
                              "idcc",
                              "opco",
                              "naf",
                            ],
                          },
                          apply: {
                            type: "object",
                            properties: {
                              phone: {
                                type: ["string", "null"],
                                description: "Téléphone de contact",
                              },
                              url: {
                                type: "string",
                                format: "uri",
                                description: "URL pour candidater",
                              },
                            },
                            required: ["phone", "url"],
                          },
                        },
                        required: ["identifier", "workplace", "apply"],
                      },
                    },
                    warnings: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          code: { type: "string" },
                        },
                        required: ["message", "code"],
                      },
                    },
                  },
                  required: ["jobs", "recruiters", "warnings"],
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    })
    .addPath("/job/v1/offer", {
      post: {
        tags: ["Job"],
        summary: "Publier une offre d'emploi en alternance",
        description: "Publiez une offre d'emploi en alternance",
        operationId: "createJobOffer",
        security: [{ "api-key": [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  identifier: {
                    type: "object",
                    properties: {
                      partner_job_id: { type: ["string", "null"] },
                    },
                  },
                  workplace: {
                    type: "object",
                    properties: {
                      siret: {
                        type: "string",
                        pattern: "^\\d{9,14}$",
                        description: "Siret de l'entreprise",
                        examples: ["13002526500013"],
                      },
                      name: {
                        type: ["string", "null"],
                        description: "Nom customisé de l'entreprise",
                      },
                      description: {
                        type: ["string", "null"],
                        description: "description de l'entreprise",
                      },
                      website: {
                        type: ["string", "null"],
                        format: "uri",
                        description: "Site web de l'entreprise",
                      },
                      address: {
                        type: ["object", "null"],
                        properties: {
                          label: {
                            type: "string",
                            description: "Adresse de l'offre, provenant du SIRET ou du partenaire",
                          },
                        },
                        required: ["label"],
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
                      start: {
                        anyOf: [
                          { type: "string", format: "date-time" },
                          { type: "string" },
                          { type: "string" },
                          { type: "null" },
                        ],
                        description: "Date de début du contrat",
                        format: "date-time",
                      },
                      duration: {
                        type: ["number", "null"],
                        description: "Durée du contrat en mois",
                      },
                      type: {
                        type: "array",
                        items: {
                          type: "string",
                          enum: ["Apprentissage", "Professionnalisation"],
                        },
                        description: "Type de contrat",
                      },
                      remote: {
                        type: ["string", "null"],
                        enum: ["onsite", "remote", "hybrid"],
                        description: "Format de travail de l'offre",
                      },
                    },
                  },
                  offer: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                        minLength: 3,
                        description: "Titre de l'offre",
                      },
                      description: {
                        type: "string",
                        description:
                          "description de l'offre, soit définit par le partenaire, soit celle du ROME si pas suffisament grande",
                      },
                      rome_codes: {
                        type: ["array", "null"],
                        items: {
                          type: "string",
                          pattern: "^[A-Z]{1}\\d{4}$",
                          example: "D1102",
                        },
                        description: "Code rome de l'offre",
                      },
                      desired_skills: {
                        type: "array",
                        items: { type: "string" },
                        description: "Compétence attendues par le candidat pour l'offre",
                      },
                      to_be_acquired_skills: {
                        type: "array",
                        items: { type: "string" },
                        description: "Compétence acuqises durant l'alternance",
                      },
                      access_conditions: {
                        type: "array",
                        items: { type: "string" },
                        description: "Conditions d'accès à l'offre",
                      },
                      opening_count: {
                        type: "number",
                        description: "Nombre de poste disponible",
                      },
                      target_diploma: {
                        type: ["object", "null"],
                        properties: {
                          european: {
                            type: "string",
                            enum: ["3", "4", "5", "6", "7"],
                            description: "Niveau de diplome visé en fin d'étude, transformé pour chaque partenaire",
                          },
                        },
                        required: ["european"],
                      },
                      creation: {
                        anyOf: [
                          { type: "string", format: "date-time" },
                          { type: "string" },
                          { type: "string" },
                          { type: "null" },
                        ],
                        description: "Date de creation de l'offre",
                        format: "date-time",
                      },
                      expiration: {
                        anyOf: [
                          { type: "string", format: "date-time" },
                          { type: "string" },
                          { type: "string" },
                          { type: "null" },
                        ],
                        description: "Date d'expiration de l'offre. Si pas présente, mettre à creation_date + 60j",
                        format: "date-time",
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
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { id: { type: "string" } },
                  required: ["id"],
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    })
    .addPath("/job/v1/offer/{id}", {
      put: {
        tags: ["Job"],
        summary: "Modification d'une offre d'emploi en alternance",
        description: "Modifiez une offre d'emploi en alternance",
        operationId: "updateJobOffer",
        security: [{ "api-key": [] }],
        parameters: [
          {
            schema: { type: "string" },
            required: true,
            name: "id",
            in: "path",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  identifier: {
                    type: "object",
                    properties: {
                      partner_job_id: { type: ["string", "null"] },
                    },
                  },
                  workplace: {
                    type: "object",
                    properties: {
                      siret: {
                        type: "string",
                        pattern: "^\\d{9,14}$",
                        description: "Siret de l'entreprise",
                        examples: ["13002526500013"],
                      },
                      name: {
                        type: ["string", "null"],
                        description: "Nom customisé de l'entreprise",
                      },
                      description: {
                        type: ["string", "null"],
                        description: "description de l'entreprise",
                      },
                      website: {
                        type: ["string", "null"],
                        format: "uri",
                        description: "Site web de l'entreprise",
                      },
                      address: {
                        type: ["object", "null"],
                        properties: {
                          label: {
                            type: "string",
                            description: "Adresse de l'offre, provenant du SIRET ou du partenaire",
                          },
                        },
                        required: ["label"],
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
                      start: {
                        anyOf: [
                          { type: "string", format: "date-time" },
                          { type: "string" },
                          { type: "string" },
                          { type: "null" },
                        ],
                        description: "Date de début du contrat",
                        format: "date-time",
                      },
                      duration: {
                        type: ["number", "null"],
                        description: "Durée du contrat en mois",
                      },
                      type: {
                        type: "array",
                        items: {
                          type: "string",
                          enum: ["Apprentissage", "Professionnalisation"],
                        },
                        description: "Type de contrat",
                      },
                      remote: {
                        type: ["string", "null"],
                        enum: ["onsite", "remote", "hybrid"],
                        description: "Format de travail de l'offre",
                      },
                    },
                  },
                  offer: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                        minLength: 3,
                        description: "Titre de l'offre",
                      },
                      description: {
                        type: "string",
                        description:
                          "description de l'offre, soit définit par le partenaire, soit celle du ROME si pas suffisament grande",
                      },
                      rome_codes: {
                        type: ["array", "null"],
                        items: {
                          type: "string",
                          pattern: "^[A-Z]{1}\\d{4}$",
                          example: "D1102",
                        },
                        description: "Code rome de l'offre",
                      },
                      desired_skills: {
                        type: "array",
                        items: { type: "string" },
                        description: "Compétence attendues par le candidat pour l'offre",
                      },
                      to_be_acquired_skills: {
                        type: "array",
                        items: { type: "string" },
                        description: "Compétence acuqises durant l'alternance",
                      },
                      access_conditions: {
                        type: "array",
                        items: { type: "string" },
                        description: "Conditions d'accès à l'offre",
                      },
                      opening_count: {
                        type: "number",
                        description: "Nombre de poste disponible",
                      },
                      target_diploma: {
                        type: ["object", "null"],
                        properties: {
                          european: {
                            type: "string",
                            enum: ["3", "4", "5", "6", "7"],
                            description: "Niveau de diplome visé en fin d'étude, transformé pour chaque partenaire",
                          },
                        },
                        required: ["european"],
                      },
                      creation: {
                        anyOf: [
                          { type: "string", format: "date-time" },
                          { type: "string" },
                          { type: "string" },
                          { type: "null" },
                        ],
                        description: "Date de creation de l'offre",
                        format: "date-time",
                      },
                      expiration: {
                        anyOf: [
                          { type: "string", format: "date-time" },
                          { type: "string" },
                          { type: "string" },
                          { type: "null" },
                        ],
                        description: "Date d'expiration de l'offre. Si pas présente, mettre à creation_date + 60j",
                        format: "date-time",
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
              },
            },
          },
        },
        responses: {
          "204": {
            description: "",
            content: { "application/json": { schema: { type: "null" } } },
          },
          ...errorResponses,
        },
      },
    });
}
