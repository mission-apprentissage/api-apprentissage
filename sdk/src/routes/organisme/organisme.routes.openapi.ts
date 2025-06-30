import { exportOrganismesRouteDoc } from "../../docs/routes/exportOrganismes/exportOrganismes.route.doc.js";
import { addErrorResponseOpenApi } from "../../models/errors/errors.model.openapi.js";
import { paginationQueryParameterObject } from "../../models/pagination/pagination.model.openapi.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const organismeRoutesOpenapi: OpenapiRoutes = {
  "/organisme/v1/recherche": {
    get: {
      tag: "organismes",
      schema: addErrorResponseOpenApi({
        summary: "Recherche d'organismes par UAI et/ou SIRET",
        description: "Récupère la liste des organismes, filtrée par UAI et/ou SIRET fournis",
        operationId: "searchOrganismes",
        security: [{ "api-key": [] }],
        parameters: [
          {
            schema: {
              anyOf: [
                {
                  type: "string",
                  pattern: "^\\d{7}[A-Z]$",
                },
                { type: "null" },
              ],
            },
            required: false,
            name: "uai",
            in: "query",
          },
          {
            schema: {
              anyOf: [
                {
                  type: "string",
                  pattern: "^\\d{14}$",
                },
                { type: "null" },
              ],
            },
            required: false,
            name: "siret",
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
                    metadata: {
                      type: "object",
                      properties: {
                        uai: {
                          anyOf: [
                            {
                              type: "object",
                              properties: {
                                status: {
                                  type: "string",
                                  enum: ["inconnu", "ok"],
                                },
                              },
                              required: ["status"],
                              additionalProperties: false,
                            },
                            { type: "null" },
                          ],
                        },
                        siret: {
                          anyOf: [
                            {
                              type: "object",
                              properties: {
                                status: {
                                  type: "string",
                                  enum: ["inconnu", "fermé", "ok"],
                                },
                              },
                              required: ["status"],
                              additionalProperties: false,
                            },
                            { type: "null" },
                          ],
                        },
                      },
                      required: ["uai", "siret"],
                      additionalProperties: false,
                    },
                    resultat: {
                      anyOf: [
                        {
                          type: "object",
                          properties: {
                            status: {
                              type: "object",
                              properties: {
                                ouvert: { type: "boolean" },
                                declaration_catalogue: { type: "boolean" },
                                validation_uai: { type: "boolean" },
                              },
                              required: ["ouvert", "declaration_catalogue", "validation_uai"],
                              additionalProperties: false,
                            },
                            correspondances: {
                              type: "object",
                              properties: {
                                uai: {
                                  anyOf: [
                                    {
                                      type: "object",
                                      properties: {
                                        lui_meme: { type: "boolean" },
                                        son_lieu: { type: "boolean" },
                                      },
                                      required: ["lui_meme", "son_lieu"],
                                      additionalProperties: false,
                                    },
                                    { type: "null" },
                                  ],
                                },
                                siret: {
                                  anyOf: [
                                    {
                                      type: "object",
                                      properties: {
                                        son_formateur: { type: "boolean" },
                                        son_responsable: { type: "boolean" },
                                        lui_meme: { type: "boolean" },
                                      },
                                      required: ["son_formateur", "son_responsable", "lui_meme"],
                                      additionalProperties: false,
                                    },
                                    { type: "null" },
                                  ],
                                },
                              },
                              required: ["uai", "siret"],
                              additionalProperties: false,
                            },
                            organisme: {
                              type: "object",
                              properties: {
                                identifiant: {
                                  type: "object",
                                  properties: {
                                    uai: {
                                      anyOf: [
                                        {
                                          type: "string",
                                          pattern: "^\\d{7}[A-Z]$",
                                        },
                                        { type: "null" },
                                      ],
                                    },
                                    siret: {
                                      type: "string",
                                      pattern: "^\\d{14}$",
                                    },
                                  },
                                  required: ["uai", "siret"],
                                  additionalProperties: false,
                                },
                              },
                              required: ["identifiant"],
                              additionalProperties: false,
                            },
                          },
                          required: ["status", "correspondances", "organisme"],
                          additionalProperties: false,
                        },
                        { type: "null" },
                      ],
                    },
                    candidats: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          status: {
                            type: "object",
                            properties: {
                              ouvert: { type: "boolean" },
                              declaration_catalogue: { type: "boolean" },
                              validation_uai: { type: "boolean" },
                            },
                            required: ["ouvert", "declaration_catalogue", "validation_uai"],
                            additionalProperties: false,
                          },
                          correspondances: {
                            type: "object",
                            properties: {
                              uai: {
                                anyOf: [
                                  {
                                    type: "object",
                                    properties: {
                                      lui_meme: { type: "boolean" },
                                      son_lieu: { type: "boolean" },
                                    },
                                    required: ["lui_meme", "son_lieu"],
                                    additionalProperties: false,
                                  },
                                  { type: "null" },
                                ],
                              },
                              siret: {
                                anyOf: [
                                  {
                                    type: "object",
                                    properties: {
                                      son_formateur: { type: "boolean" },
                                      son_responsable: { type: "boolean" },
                                      lui_meme: { type: "boolean" },
                                    },
                                    required: ["son_formateur", "son_responsable", "lui_meme"],
                                    additionalProperties: false,
                                  },
                                  { type: "null" },
                                ],
                              },
                            },
                            required: ["uai", "siret"],
                            additionalProperties: false,
                          },
                          organisme: {
                            type: "object",
                            properties: {
                              identifiant: {
                                type: "object",
                                properties: {
                                  uai: {
                                    anyOf: [
                                      {
                                        type: "string",
                                        pattern: "^\\d{7}[A-Z]$",
                                      },
                                      { type: "null" },
                                    ],
                                  },
                                  siret: {
                                    type: "string",
                                    pattern: "^\\d{14}$",
                                  },
                                },
                                required: ["uai", "siret"],
                                additionalProperties: false,
                              },
                            },
                            required: ["identifiant"],
                            additionalProperties: false,
                          },
                        },
                        required: ["status", "correspondances", "organisme"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["metadata", "resultat", "candidats"],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      }),
      doc: null,
    },
  },
  "/organisme/v1/export": {
    get: {
      tag: "organismes",
      schema: addErrorResponseOpenApi({
        operationId: "exportOrganismes",
        security: [{ "api-key": [] }],
        parameters: paginationQueryParameterObject,
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
                        $ref: "#/components/schemas/Organisme",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                  required: ["data", "pagination"],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      }),
      doc: exportOrganismesRouteDoc,
    },
  },
};
