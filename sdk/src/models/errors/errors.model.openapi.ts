import type { OpenApiBuilder, OperationObject, ResponseObject } from "openapi3-ts/oas31";

const descriptions = {
  fr: {
    data: "Données contextuelles liées à l'erreur",
    message: "Un message explicatif de l'erreur",
    name: "Le type générique de l'erreur",
    statusCode: "Le status code retourné",
    badRequestResponse: "Requête invalide",
    unauthorizedResponse: "Clé d’API manquante ou invalide",
    forbiddenResponse: "Habilitations insuffisantes pour accéder à la ressource",
    notFoundResponse: "Ressource non trouvée",
    conflictResponse: "Conflit de ressource",
    tooManyRequestsResponse: "Limite de volumétrie atteinte pour la clé d’API",
    internalServerErrorResponse: "Une erreur inattendue s'est produite sur le serveur.",
    badGatewayResponse: "Le service est indisponible.",
    serviceUnavailableResponse: "Le service est en maintenance",
  },
  en: {
    data: "Error context data",
    message: "An explanatory message of the error",
    name: "The generic type of the error",
    statusCode: "The returned status code",
    badRequestResponse: "Bad Request",
    unauthorizedResponse: "Unauthorized",
    forbiddenResponse: "Insufficient permissions to access the resource",
    notFoundResponse: "Resource not found",
    conflictResponse: "Resource conflict",
    tooManyRequestsResponse: "API key rate limit exceeded",
    internalServerErrorResponse: "An unexpected error occurred on the server.",
    badGatewayResponse: "Service is unavailable.",
    serviceUnavailableResponse: "Service is under maintenance",
  },
} as const;

export function registerOpenApiErrorsSchema(builder: OpenApiBuilder, lang: "en" | "fr"): OpenApiBuilder {
  const badRequestResponse: ResponseObject = {
    description: descriptions[lang].badRequestResponse,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: descriptions[lang].data },
            message: {
              type: "string",
              description: descriptions[lang].message,
              examples: ["Request validation failed"],
            },
            name: {
              type: "string",
              description: descriptions[lang].name,
              examples: ["Bad Request"],
            },
            statusCode: {
              type: "number",
              enum: [400],
              description: descriptions[lang].statusCode,
            },
          },
          required: ["message", "name", "statusCode"],
          additionalProperties: false,
          description: descriptions[lang].badRequestResponse,
        },
      },
    },
  };

  const unauthorizedResponse: ResponseObject = {
    description: descriptions[lang].unauthorizedResponse,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: descriptions[lang].data },
            message: {
              type: "string",
              description: descriptions[lang].message,
              example: "Vous devez être connecté pour accéder à cette ressource",
            },
            name: {
              type: "string",
              description: descriptions[lang].name,
              example: "Unauthorized",
            },
            statusCode: {
              type: "number",
              enum: [401],
              description: descriptions[lang].statusCode,
            },
          },
          required: ["message", "name", "statusCode"],
          additionalProperties: false,
          description: descriptions[lang].unauthorizedResponse,
        },
      },
    },
  };

  const forbiddenResponse: ResponseObject = {
    description: descriptions[lang].forbiddenResponse,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: descriptions[lang].data },
            message: {
              type: "string",
              description: descriptions[lang].message,
              example: "Le jeton d'accès est invalide",
            },
            name: {
              type: "string",
              description: descriptions[lang].name,
              example: "Forbidden",
            },
            statusCode: {
              type: "number",
              enum: [403],
              description: descriptions[lang].statusCode,
            },
          },
          required: ["message", "name", "statusCode"],
          additionalProperties: false,
          description: descriptions[lang].forbiddenResponse,
        },
      },
    },
  };

  const notFoundResponse: ResponseObject = {
    description: descriptions[lang].notFoundResponse,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: descriptions[lang].data },
            message: {
              type: "string",
              description: descriptions[lang].message,
              example: "Resource non trouvée",
            },
            name: {
              type: "string",
              description: descriptions[lang].name,
              example: "Not Found",
            },
            statusCode: {
              type: "number",
              enum: [404],
              description: descriptions[lang].statusCode,
            },
          },
          required: ["message", "name", "statusCode"],
          additionalProperties: false,
          description: descriptions[lang].notFoundResponse,
        },
      },
    },
  };

  const conflictResponse: ResponseObject = {
    description: descriptions[lang].conflictResponse,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: descriptions[lang].data },
            message: {
              type: "string",
              description: descriptions[lang].message,
              example: "La ressource exite déjà",
            },
            name: {
              type: "string",
              description: descriptions[lang].name,
              example: "Conflict",
            },
            statusCode: {
              type: "number",
              enum: [409],
              description: descriptions[lang].statusCode,
            },
          },
          required: ["message", "name", "statusCode"],
          additionalProperties: false,
          description: descriptions[lang].conflictResponse,
        },
      },
    },
  };

  const tooManyRequestsResponse: ResponseObject = {
    description: descriptions[lang].tooManyRequestsResponse,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: descriptions[lang].data },
            message: {
              type: "string",
              description: descriptions[lang].message,
              example: "Limite de requêtes atteinte",
            },
            name: {
              type: "string",
              description: descriptions[lang].name,
              example: "Too Many Requests",
            },
            statusCode: {
              type: "number",
              enum: [419],
              description: descriptions[lang].statusCode,
            },
          },
          required: ["message", "name", "statusCode"],
          additionalProperties: false,
          description: descriptions[lang].tooManyRequestsResponse,
        },
      },
    },
  };

  const internalServerErrorResponse: ResponseObject = {
    description: descriptions[lang].internalServerErrorResponse,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: descriptions[lang].data },
            message: {
              type: "string",
              description: descriptions[lang].message,
              example: "The server was unable to complete your request",
            },
            name: {
              type: "string",
              description: descriptions[lang].name,
              example: "Internal Server Error",
            },
            statusCode: {
              type: "number",
              enum: [500],
              description: descriptions[lang].statusCode,
            },
          },
          required: ["message", "name", "statusCode"],
          additionalProperties: false,
          description: descriptions[lang].internalServerErrorResponse,
        },
      },
    },
  };

  const badGatewayResponse: ResponseObject = {
    description: descriptions[lang].badGatewayResponse,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: descriptions[lang].data },
            message: {
              type: "string",
              description: descriptions[lang].message,
              example: "The server was unable to complete your request",
            },
            name: {
              type: "string",
              description: descriptions[lang].name,
              example: "Bad Gateway",
            },
            statusCode: {
              type: "number",
              enum: [502],
              description: descriptions[lang].statusCode,
            },
          },
          required: ["message", "name", "statusCode"],
          additionalProperties: false,
          description: descriptions[lang].badGatewayResponse,
        },
      },
    },
  };

  const serviceUnavailableResponse: ResponseObject = {
    description: descriptions[lang].serviceUnavailableResponse,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: descriptions[lang].data },
            message: {
              type: "string",
              description: descriptions[lang].message,
              example: "The server was unable to complete your request",
            },
            name: {
              type: "string",
              description: descriptions[lang].name,
              example: "Service Unavailable",
            },
            statusCode: {
              type: "number",
              enum: [502],
              description: descriptions[lang].statusCode,
            },
          },
          required: ["message", "name", "statusCode"],
          additionalProperties: false,
          description: descriptions[lang].serviceUnavailableResponse,
        },
      },
    },
  };

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
