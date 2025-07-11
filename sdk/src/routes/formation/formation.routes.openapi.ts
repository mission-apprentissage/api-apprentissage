import { generateFormationAppointmentLinkRouteDoc } from "../../docs/routes/generateFormationAppointmentLink/generateFormationAppointmentLink.doc.js";
import { searchFormationByIdRouteDoc } from "../../docs/routes/searchFormationById/searchFormationById.route.doc.js";
import { searchFormationsRouteDoc } from "../../docs/routes/searchFormations/searchFormations.route.doc.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const formationRoutesOpenapi: OpenapiRoutes = {
  "/formation/v1/search": {
    get: {
      tag: "formation",
      doc: searchFormationsRouteDoc,
    },
  },
  "/formation/v1/:id": {
    get: {
      tag: "formation",
      doc: searchFormationByIdRouteDoc,
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
                anyOf: [
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
                  anyOf: [
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
