import type { OpenApiBuilder, SchemaObject } from "openapi3-ts/oas31";

const badRequestSchema: SchemaObject = {
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
};

const UnauthorizedSchema: SchemaObject = {
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
};

const ForbiddenSchema: SchemaObject = {
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
};

const NotFoundSchema: SchemaObject = {
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
};

const ConflictSchema: SchemaObject = {
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
};

const TooManyRequestsSchema: SchemaObject = {
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
};

const InternalServerErrorSchema: SchemaObject = {
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
};

const BadGatewaySchema: SchemaObject = {
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
};

const ServiceUnavailableSchema: SchemaObject = {
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
};

export function registerOpenApiErrorsSchema(builder: OpenApiBuilder): OpenApiBuilder {
  return builder
    .addSchema("BadRequest", badRequestSchema)
    .addSchema("Unauthorized", UnauthorizedSchema)
    .addSchema("Forbidden", ForbiddenSchema)
    .addSchema("Conflict", ConflictSchema)
    .addSchema("NotFound", NotFoundSchema)
    .addSchema("TooManyRequests", TooManyRequestsSchema)
    .addSchema("InternalServerError", InternalServerErrorSchema)
    .addSchema("BadGateway", BadGatewaySchema)
    .addSchema("ServiceUnavailable", ServiceUnavailableSchema);
}
