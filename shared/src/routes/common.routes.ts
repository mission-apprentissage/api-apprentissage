import type { IApiRouteSchemaCommon, IApiRouteSchemaGet, IApiRouteSchemaWrite } from "api-alternance-sdk";
import {
  zResBadGateway,
  zResBadRequest,
  ZResError,
  zResForbidden,
  zResInternalServerError,
  zResNotFound,
  zResServiceUnavailable,
  zResTooManyRequest,
  zResUnauthorized,
} from "api-alternance-sdk";
import { zodOpenApi } from "api-alternance-sdk/internal";
import type { Jsonify } from "type-fest";
import type { AnyZodObject, z } from "zod";

import type { AccessPermission, AccessRessouces } from "../security/permissions.js";

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
    organisation: string | null;
  };
  scopes: ReadonlyArray<IAccessTokenScope<S>>;
};
