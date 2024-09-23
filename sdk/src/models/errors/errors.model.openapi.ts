import type { OpenApiBuilder, OperationObject, ResponseObject } from "openapi3-ts/oas31";

const badRequestResponse: ResponseObject = {
  description: "Requête invalide",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { description: "Données contextuelles liées à l'erreur" },
          message: {
            type: "string",
            description: "Un message explicatif de l'erreur",
            example: "Request validation failed",
          },
          name: {
            type: "string",
            description: "Le type générique de l'erreur",
            example: "Bad Request",
          },
          statusCode: {
            type: "number",
            enum: [400],
            description: "Le status code retourné",
          },
        },
        required: ["message", "name", "statusCode"],
        additionalProperties: false,
        description: "Paramètre de requête non valide.",
      },
    },
  },
};

const unauthorizedResponse: ResponseObject = {
  description: "Clé d’API manquante ou invalide",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { description: "Données contextuelles liées à l'erreur" },
          message: {
            type: "string",
            description: "Un message explicatif de l'erreur",
            example: "Request validation failed",
          },
          name: {
            type: "string",
            description: "Le type générique de l'erreur",
            example: "Bad Request",
          },
          statusCode: {
            type: "number",
            enum: [401],
            description: "Le status code retourné",
          },
        },
        required: ["message", "name", "statusCode"],
        additionalProperties: false,
        description: "Clé d’API manquante ou invalide",
      },
    },
  },
};

const forbiddenResponse: ResponseObject = {
  description: "Habilitations insuffisantes pour accéder à la ressource",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { description: "Données contextuelles liées à l'erreur" },
          message: {
            type: "string",
            description: "Un message explicatif de l'erreur",
            example: "Request validation failed",
          },
          name: {
            type: "string",
            description: "Le type générique de l'erreur",
            example: "Bad Request",
          },
          statusCode: {
            type: "number",
            enum: [403],
            description: "Le status code retourné",
          },
        },
        required: ["message", "name", "statusCode"],
        additionalProperties: false,
        description: "Habilitations insuffisantes pour accéder à la ressource",
      },
    },
  },
};

const notFoundResponse: ResponseObject = {
  description: "Resource non trouvée",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { description: "Données contextuelles liées à l'erreur" },
          message: {
            type: "string",
            description: "Un message explicatif de l'erreur",
            example: "Request validation failed",
          },
          name: {
            type: "string",
            description: "Le type générique de l'erreur",
            example: "Bad Request",
          },
          statusCode: {
            type: "number",
            enum: [404],
            description: "Le status code retourné",
          },
        },
        required: ["message", "name", "statusCode"],
        additionalProperties: false,
        description: "Resource non trouvée",
      },
    },
  },
};

const conflictResponse: ResponseObject = {
  description: "Conflit",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { description: "Données contextuelles liées à l'erreur" },
          message: {
            type: "string",
            description: "Un message explicatif de l'erreur",
            example: "Request validation failed",
          },
          name: {
            type: "string",
            description: "Le type générique de l'erreur",
            example: "Bad Request",
          },
          statusCode: {
            type: "number",
            enum: [409],
            description: "Le status code retourné",
          },
        },
        required: ["message", "name", "statusCode"],
        additionalProperties: false,
        description: "Conflit de ressource",
      },
    },
  },
};

const tooManyRequestsResponse: ResponseObject = {
  description: "Limite de volumétrie atteinte pour la clé d’API",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { description: "Données contextuelles liées à l'erreur" },
          message: {
            type: "string",
            description: "Un message explicatif de l'erreur",
            example: "Request validation failed",
          },
          name: {
            type: "string",
            description: "Le type générique de l'erreur",
            example: "Bad Request",
          },
          statusCode: {
            type: "number",
            enum: [419],
            description: "Le status code retourné",
          },
        },
        required: ["message", "name", "statusCode"],
        additionalProperties: false,
        description: "Limite de volumétrie atteinte pour la clé d’API",
      },
    },
  },
};

const internalServerErrorResponse: ResponseObject = {
  description: "Une erreur inattendue s'est produite sur le serveur.",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { description: "Données contextuelles liées à l'erreur" },
          message: {
            type: "string",
            description: "Un message explicatif de l'erreur",
            example: "Request validation failed",
          },
          name: {
            type: "string",
            description: "Le type générique de l'erreur",
            example: "Bad Request",
          },
          statusCode: {
            type: "number",
            enum: [500],
            description: "Le status code retourné",
          },
        },
        required: ["message", "name", "statusCode"],
        additionalProperties: false,
        description: "Une erreur inattendue s'est produite sur le serveur.",
      },
    },
  },
};

const badGatewayResponse: ResponseObject = {
  description: "Le service est indisponible.",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { description: "Données contextuelles liées à l'erreur" },
          message: {
            type: "string",
            description: "Un message explicatif de l'erreur",
            example: "Request validation failed",
          },
          name: {
            type: "string",
            description: "Le type générique de l'erreur",
            example: "Bad Request",
          },
          statusCode: {
            type: "number",
            enum: [502],
            description: "Le status code retourné",
          },
        },
        required: ["message", "name", "statusCode"],
        additionalProperties: false,
        description: "Le service est indisponible.",
      },
    },
  },
};

const serviceUnavailableResponse: ResponseObject = {
  description: "Le service est en maintenance",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { description: "Données contextuelles liées à l'erreur" },
          message: {
            type: "string",
            description: "Un message explicatif de l'erreur",
            example: "Request validation failed",
          },
          name: {
            type: "string",
            description: "Le type générique de l'erreur",
            example: "Bad Request",
          },
          statusCode: {
            type: "number",
            enum: [502],
            description: "Le status code retourné",
          },
        },
        required: ["message", "name", "statusCode"],
        additionalProperties: false,
        description: "Le service est en maintenance",
      },
    },
  },
};

export function registerOpenApiErrorsSchema(builder: OpenApiBuilder): OpenApiBuilder {
  return builder
    .addResponse("BadRequest", badRequestResponse)
    .addResponse("Unauthorized", unauthorizedResponse)
    .addResponse("Forbidden", forbiddenResponse)
    .addResponse("Conflict", conflictResponse)
    .addResponse("NotFound", notFoundResponse)
    .addResponse("TooManyRequests", tooManyRequestsResponse)
    .addResponse("InternalServerError", internalServerErrorResponse)
    .addResponse("BadGateway", badGatewayResponse)
    .addResponse("ServiceUnavailable", serviceUnavailableResponse);
}

export function addErrorResponseOpenApi(schema: OperationObject): OperationObject {
  return {
    ...schema,
    responses: {
      ...schema.responses,
      "400": { $ref: "#/components/responses/BadRequest" },
      "401": { $ref: "#/components/responses/Unauthorized" },
      "403": { $ref: "#/components/responses/Forbidden" },
      "404": { $ref: "#/components/responses/NotFound" },
      "409": { $ref: "#/components/responses/Conflict" },
      "419": { $ref: "#/components/responses/TooManyRequests" },
      "500": { $ref: "#/components/responses/InternalServerError" },
      "502": { $ref: "#/components/responses/BadGateway" },
      "503": { $ref: "#/components/responses/ServiceUnavailable" },
    },
  };
}
