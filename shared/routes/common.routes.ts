import { oas31 } from "openapi3-ts";
import { Jsonify } from "type-fest";
import { AnyZodObject, ZodType } from "zod";

import { AccessPermission, AccessRessouces } from "../security/permissions";
import { zodOpenApi } from "../zod/zodWithOpenApi";

export const zResBadRequest = zodOpenApi
  .object({
    data: zodOpenApi
      .any()
      .optional()
      .openapi({
        description: "Données contextuelles liées à l'erreur",
        example: {
          validationError: {
            _errors: [],
            "code.cfd": {
              _errors: ["Invalid"],
            },
            "code.rncp": {
              _errors: ["Invalid"],
            },
          },
        },
      }),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "Request validation failed",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Bad Request",
    }),
    statusCode: zodOpenApi.literal(400).openapi({
      description: "Le status code retourné",
    }),
  })
  .strict()
  .openapi({ description: "Paramètre de requête non valide." });

export const zResUnauthorized = zodOpenApi
  .object({
    data: zodOpenApi.any().optional().openapi({
      description: "Données contextuelles liées à l'erreur",
    }),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "Unauthorized",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Unauthorized",
    }),
    statusCode: zodOpenApi.literal(401).openapi({
      description: "Le status code retourné",
    }),
  })
  .strict()
  .openapi({
    description: "Clé d’API manquante ou invalide",
  });

export const zResForbidden = zodOpenApi
  .object({
    data: zodOpenApi.any().optional().openapi({
      description: "Données contextuelles liées à l'erreur",
    }),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "Forbidden",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Forbidden",
    }),
    statusCode: zodOpenApi.literal(403).openapi({
      description: "Le status code retourné",
    }),
  })
  .strict()
  .openapi({
    description: "Habilitations insuffisantes pour accéder à la ressource",
  });

export const zResNotFound = zodOpenApi
  .object({
    data: zodOpenApi.any().optional().openapi({
      description: "Données contextuelles liées à l'erreur",
    }),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "Not Found",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Not Found",
    }),
    statusCode: zodOpenApi.literal(404).openapi({
      description: "Le status code retourné",
    }),
  })
  .strict()
  .openapi({
    description: "Resource non trouvée",
  });

export const zResTooManyRequest = zodOpenApi
  .object({
    data: zodOpenApi.any().optional().openapi({
      description: "Données contextuelles liées à l'erreur",
    }),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "Too Many Requests",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Too Many Requests",
    }),
    statusCode: zodOpenApi.literal(419).openapi({
      description: "Le status code retourné",
    }),
  })
  .strict()
  .openapi({
    description: "Limite de volumétrie atteinte pour la clé d’API",
  });

export const zResInternalServerError = zodOpenApi
  .object({
    data: zodOpenApi.any().optional().openapi({
      description: "Données contextuelles liées à l'erreur",
    }),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "Internal Server Error",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Internal Server Error",
    }),
    statusCode: zodOpenApi.literal(500).openapi({
      description: "Le status code retourné",
    }),
  })
  .strict()
  .openapi({
    description: "Une erreur inattendue s'est produite sur le serveur.",
  });

export const zResBadGateway = zodOpenApi
  .object({
    data: zodOpenApi.any().optional().openapi({
      description: "Données contextuelles liées à l'erreur",
    }),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "Bad Gateway",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Bad Gateway",
    }),
    statusCode: zodOpenApi.literal(502).openapi({
      description: "Le status code retourné",
    }),
  })
  .strict()
  .openapi({
    description: "Le service est indisponible.",
  });

export const zResServiceUnavailable = zodOpenApi
  .object({
    data: zodOpenApi.any().optional().openapi({
      description: "Données contextuelles liées à l'erreur",
    }),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "Service Unavailable",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Service Unavailable",
    }),
    statusCode: zodOpenApi.literal(502).openapi({
      description: "Le status code retourné",
    }),
  })
  .strict()
  .openapi({
    description: "Le service est en maintenance",
  });

export const ZResError = zodOpenApi
  .object({
    data: zodOpenApi
      .any()
      .optional()
      .openapi({
        description: "Données contextuelles liées à l'erreur",
        example: {
          validationError: {
            _errors: [],
            "code.cfd": {
              _errors: ["Invalid"],
            },
            "code.rncp": {
              _errors: ["Invalid"],
            },
          },
        },
      }),
    code: zodOpenApi.string().nullish(),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "Request validation failed",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Bad Request",
    }),
    statusCode: zodOpenApi.number().openapi({
      description: "Le status code retourné",
      example: 400,
    }),
  })
  .strict();

export const ZResOk = zodOpenApi.object({}).strict();

export type IResError = zodOpenApi.input<typeof ZResError>;
export type IResErrorJson = Jsonify<zodOpenApi.output<typeof ZResError>>;

export const ZReqParamsSearchPagination = zodOpenApi
  .object({
    page: zodOpenApi.preprocess((v) => parseInt(v as string, 10), zodOpenApi.number().positive().optional()),
    limit: zodOpenApi.preprocess((v) => parseInt(v as string, 10), zodOpenApi.number().positive().optional()),
    q: zodOpenApi.string().optional(),
  })
  .strict();
export type IReqParamsSearchPagination = zodOpenApi.input<typeof ZReqParamsSearchPagination>;

export const ZReqHeadersAuthorization = zodOpenApi
  .object({
    Authorization: zodOpenApi.string().describe("Bearer token").optional(),
  })
  .passthrough();

export type AuthStrategy = "api-key" | "cookie-session" | "access-token";

export type SecuritySchemeWithAcl = {
  auth: AuthStrategy;
  access: AccessPermission;
  ressources: AccessRessouces;
};

export type SecuritySchemeNoAcl = {
  auth: AuthStrategy;
  access: null;
  ressources: Record<string, never>;
};

export type SecurityScheme = SecuritySchemeWithAcl | SecuritySchemeNoAcl;

interface IRouteSchemaCommon {
  path: string;
  querystring?: AnyZodObject;
  headers?: AnyZodObject;
  params?: AnyZodObject;
  response: { [statuscode: `${1 | 2 | 3 | 4 | 5}${string}`]: ZodType };
  openapi?: null | Omit<oas31.OperationObject, "parameters" | "requestBody" | "requestParams" | "responses">;
  securityScheme: SecurityScheme | null;
}

export interface IRouteSchemaGet extends IRouteSchemaCommon {
  method: "get";
}

export interface IRouteSchemaWrite extends IRouteSchemaCommon {
  method: "post" | "put" | "patch" | "delete";
  body?: ZodType;
}

export type WithSecurityScheme = {
  securityScheme: SecurityScheme;
};

export type IRouteSchema = IRouteSchemaGet | IRouteSchemaWrite;
export type ISecuredRouteSchema = IRouteSchema & WithSecurityScheme;

export type IRoutesDef = {
  get?: Record<string, IRouteSchemaGet>;
  post?: Record<string, IRouteSchemaWrite>;
  put?: Record<string, IRouteSchemaWrite>;
  delete?: Record<string, IRouteSchemaWrite>;
  patch?: Record<string, IRouteSchemaWrite>;
};
