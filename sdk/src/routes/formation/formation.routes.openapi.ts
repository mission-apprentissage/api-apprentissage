import { generateFormationAppointmentLinkRouteDoc } from "../../docs/routes/generateFormationAppointmentLink/generateFormationAppointmentLink.doc.js";
import { searchFormationsRouteDoc } from "../../docs/routes/searchFormations/searchFormations.route.doc.js";
import { addErrorResponseOpenApi } from "../../models/errors/errors.model.openapi.js";
import { paginationQueryParameterObject } from "../../models/pagination/pagination.model.openapi.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const formationRoutesOpenapi: OpenapiRoutes = {
  "/formation/v1/search": {
    get: {
      tag: "formation",
      schema: addErrorResponseOpenApi({
        operationId: "searchFormations",
        security: [{ "api-key": [] }],
        parameters: [
          {
            schema: {
              type: "number",
              minimum: -180,
              maximum: 180,
            },
            required: false,
            name: "longitude",
            in: "query",
          },
          {
            schema: {
              type: "number",
              minimum: -90,
              maximum: 90,
            },
            required: false,
            name: "latitude",
            in: "query",
          },
          {
            schema: {
              type: "number",
              minimum: 0,
              maximum: 200,
              default: 30,
            },
            required: false,
            name: "radius",
            in: "query",
          },
          {
            schema: {
              type: "string",
              enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
            },
            required: false,
            name: "target_diploma_level",
            in: "query",
          },
          {
            schema: {
              type: "string",
            },
            required: false,
            name: "romes",
            in: "query",
          },
          {
            schema: {
              type: "string",
              pattern: "^RNCP\\d{3,5}$",
            },
            required: false,
            name: "rncp",
            in: "query",
          },
          {
            schema: {
              type: "string",
              default: "false",
              enum: ["true", "false"],
            },
            required: false,
            name: "include_archived",
            in: "query",
          },
          ...paginationQueryParameterObject,
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Formation",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                  required: ["data", "pagination"],
                },
              },
            },
          },
        },
      }),
      doc: searchFormationsRouteDoc,
    },
  },
  "/formation/v1/appointment/generate-link": {
    post: {
      tag: "formation",
      doc: generateFormationAppointmentLinkRouteDoc,
      schema: {
        operationId: "generateFormationAppointmentLink",
        security: [{ "api-key": [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  {
                    type: "object",
                    required: ["cle_ministere_educatif"],
                    properties: {
                      cle_ministere_educatif: {
                        type: "string",
                      },
                    },
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    required: ["parcoursup_id"],
                    properties: {
                      parcoursup_id: {
                        type: "string",
                      },
                    },
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    required: ["onisep_id"],
                    properties: {
                      onisep_id: {
                        type: "string",
                      },
                    },
                    additionalProperties: false,
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      type: "object",
                      required: [
                        "etablissement_formateur_entreprise_raison_sociale",
                        "intitule_long",
                        "lieu_formation_adresse",
                        "code_postal",
                        "etablissement_formateur_siret",
                        "cfd",
                        "localite",
                        "cle_ministere_educatif",
                        "form_url",
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
                      additionalProperties: false,
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
          },
        },
      },
    },
  },
};
