import {
  IApiRouteSchemaCommon,
  IApiRouteSchemaGet,
  IApiRouteSchemaWrite,
  zResBadGateway as _zResBadGateway,
  zResBadRequest as _zResBadRequest,
  ZResError as _ZResError,
  zResForbidden as _zResForbidden,
  zResInternalServerError as _zResInternalServerError,
  zResNotFound as _zResNotFound,
  zResServiceUnavailable as _zResServiceUnavailable,
  zResTooManyRequest as _zResTooManyRequest,
  zResUnauthorized as _zResUnauthorized,
} from "api-alternance-sdk";
import { zodOpenApi } from "api-alternance-sdk/internal";
import { Jsonify } from "type-fest";
import { AnyZodObject, z } from "zod";

import { AccessPermission, AccessRessouces } from "../security/permissions.js";

const zResBadRequest = _zResBadRequest.openapi({ description: "Paramètre de requête non valide." });
const zResUnauthorized = _zResUnauthorized.openapi({ description: "Clé d’API manquante ou invalide" });
const zResForbidden = _zResForbidden.openapi({
  description: "Habilitations insuffisantes pour accéder à la ressource",
});
const zResNotFound = _zResNotFound.openapi({ description: "Resource non trouvée" });
const zResTooManyRequest = _zResTooManyRequest.openapi({
  description: "Limite de volumétrie atteinte pour la clé d’API",
});
const zResInternalServerError = _zResInternalServerError.openapi({
  description: "Une erreur inattendue s'est produite sur le serveur.",
});
const zResBadGateway = _zResBadGateway.openapi({ description: "Le service est indisponible." });
const zResServiceUnavailable = _zResServiceUnavailable.openapi({ description: "Le service est en maintenance" });
const ZResError = _ZResError.openapi({ description: "Erreur générique" });

for (const zErr of [
  _zResBadRequest,
  _zResUnauthorized,
  _zResForbidden,
  _zResNotFound,
  _zResTooManyRequest,
  _zResInternalServerError,
  _zResBadGateway,
  _zResServiceUnavailable,
  _ZResError,
]) {
  zErr.shape.data = zErr.shape.data.openapi({
    description: "Données contextuelles liées à l'erreur",
  });
  zErr.shape.message = zErr.shape.message.openapi({
    description: "Un message explicatif de l'erreur",
    example: "Request validation failed",
  });
  zErr.shape.name = zErr.shape.name.openapi({
    description: "Le type générique de l'erreur",
    example: "Bad Request",
  });
  zErr.shape.statusCode = zErr.shape.statusCode.openapi({
    description: "Le status code retourné",
  });
}

export {
  zResBadGateway,
  zResBadRequest,
  ZResError,
  zResForbidden,
  zResInternalServerError,
  zResNotFound,
  zResServiceUnavailable,
  zResTooManyRequest,
  zResUnauthorized,
};

export const ZResOk = zodOpenApi.object({}).strict();

export type { IResError, IResErrorJson } from "api-alternance-sdk";

export const ZReqParamsSearchPagination = zodOpenApi
  .object({
    page: zodOpenApi.preprocess((v) => parseInt(v as string, 10), zodOpenApi.number().positive().optional()),
    limit: zodOpenApi.preprocess((v) => parseInt(v as string, 10), zodOpenApi.number().positive().optional()),
    q: zodOpenApi.string().optional(),
  })
  .strict();
export type IReqParamsSearchPagination = z.input<typeof ZReqParamsSearchPagination>;

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
  openapi?: null | IApiRouteSchemaCommon["openapi"];
  securityScheme: SecurityScheme | null;
}

export interface IRouteSchemaGet extends Omit<IApiRouteSchemaGet, "openapi">, IRouteSchemaCommon {}

export interface IRouteSchemaWrite extends Omit<IApiRouteSchemaWrite, "openapi">, IRouteSchemaCommon {}

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

export type SchemaWithSecurity = Pick<IRouteSchema, "method" | "path" | "params" | "querystring"> & WithSecurityScheme;

export type IAccessTokenScope<S extends SchemaWithSecurity> = {
  path: S["path"];
  method: S["method"];
  options:
    | "all"
    | {
        params: S["params"] extends AnyZodObject ? Partial<Jsonify<z.input<S["params"]>>> : undefined;
        querystring: S["querystring"] extends AnyZodObject ? Partial<Jsonify<z.input<S["querystring"]>>> : undefined;
      };
  resources: {
    [key in keyof S["securityScheme"]["ressources"]]: ReadonlyArray<string>;
  };
};

export type IAccessTokenScopeParam<S extends SchemaWithSecurity> = Pick<
  IAccessTokenScope<S>,
  "options" | "resources"
> & {
  schema: S;
};

export type IAccessToken<S extends SchemaWithSecurity = SchemaWithSecurity> = {
  identity: {
    email: string;
  };
  scopes: ReadonlyArray<IAccessTokenScope<S>>;
};
