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
              type: ["string", "null"],
              pattern: "^\\d{1,7}[A-Z]$",
            },
            required: false,
            name: "uai",
            in: "query",
          },
          {
            schema: { type: ["string", "null"], pattern: "^\\d{9,14}$" },
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
                          type: ["object", "null"],
                          properties: {
                            status: {
                              type: "string",
                              enum: ["inconnu", "ok"],
                            },
                          },
                          required: ["status"],
                        },
                        siret: {
                          type: ["object", "null"],
                          properties: {
                            status: {
                              type: "string",
                              enum: ["inconnu", "fermé", "ok"],
                            },
                          },
                          required: ["status"],
                        },
                      },
                      required: ["uai", "siret"],
                    },
                    resultat: {
                      type: ["object", "null"],
                      properties: {
                        status: {
                          type: "object",
                          properties: {
                            ouvert: { type: "boolean" },
                            declaration_catalogue: { type: "boolean" },
                            validation_uai: { type: "boolean" },
                          },
                          required: ["ouvert", "declaration_catalogue", "validation_uai"],
                        },
                        correspondances: {
                          type: "object",
                          properties: {
                            uai: {
                              type: ["object", "null"],
                              properties: {
                                lui_meme: { type: "boolean" },
                                son_lieu: { type: "boolean" },
                              },
                              required: ["lui_meme", "son_lieu"],
                            },
                            siret: {
                              type: ["object", "null"],
                              properties: {
                                son_formateur: { type: "boolean" },
                                son_responsable: { type: "boolean" },
                                lui_meme: { type: "boolean" },
                              },
                              required: ["son_formateur", "son_responsable", "lui_meme"],
                            },
                          },
                          required: ["uai", "siret"],
                        },
                        organisme: {
                          type: "object",
                          properties: {
                            identifiant: {
                              type: "object",
                              properties: {
                                uai: {
                                  type: ["string", "null"],
                                  pattern: "^\\d{1,7}[A-Z]$",
                                },
                                siret: {
                                  type: "string",
                                  pattern: "^\\d{9,14}$",
                                },
                              },
                              required: ["uai", "siret"],
                            },
                          },
                          required: ["identifiant"],
                        },
                      },
                      required: ["status", "correspondances", "organisme"],
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
                          },
                          correspondances: {
                            type: "object",
                            properties: {
                              uai: {
                                type: ["object", "null"],
                                properties: {
                                  lui_meme: { type: "boolean" },
                                  son_lieu: { type: "boolean" },
                                },
                                required: ["lui_meme", "son_lieu"],
                              },
                              siret: {
                                type: ["object", "null"],
                                properties: {
                                  son_formateur: { type: "boolean" },
                                  son_responsable: { type: "boolean" },
                                  lui_meme: { type: "boolean" },
                                },
                                required: ["son_formateur", "son_responsable", "lui_meme"],
                              },
                            },
                            required: ["uai", "siret"],
                          },
                          organisme: {
                            type: "object",
                            properties: {
                              identifiant: {
                                type: "object",
                                properties: {
                                  uai: {
                                    type: ["string", "null"],
                                    pattern: "^\\d{1,7}[A-Z]$",
                                  },
                                  siret: {
                                    type: "string",
                                    pattern: "^\\d{9,14}$",
                                  },
                                },
                                required: ["uai", "siret"],
                              },
                            },
                            required: ["identifiant"],
                          },
                        },
                        required: ["status", "correspondances", "organisme"],
                      },
                    },
                  },
                  required: ["metadata", "resultat", "candidats"],
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
