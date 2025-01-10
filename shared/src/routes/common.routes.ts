import type { IApiRouteSchemaGet, IApiRouteSchemaWrite } from "api-alternance-sdk";
import type { Jsonify } from "type-fest";
import type { AnyZodObject } from "zod";
import { z } from "zod";

import type { AccessPermission, AccessRessouces } from "../security/permissions.js";

export const ZResOk = z.object({}).strict();

export type { IResError, IResErrorJson } from "api-alternance-sdk";

export const ZReqParamsSearchPagination = z
  .object({
    page: z.preprocess((v) => parseInt(v as string, 10), z.number().positive().optional()),
    limit: z.preprocess((v) => parseInt(v as string, 10), z.number().positive().optional()),
    q: z.string().optional(),
  })
  .strict();
export type IReqParamsSearchPagination = z.input<typeof ZReqParamsSearchPagination>;

export const ZReqHeadersAuthorization = z
  .object({
    Authorization: z.string().describe("Bearer token").optional(),
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
  securityScheme: SecurityScheme | null;
}

export interface IRouteSchemaGet extends IApiRouteSchemaGet, IRouteSchemaCommon {}

export interface IRouteSchemaWrite extends IApiRouteSchemaWrite, IRouteSchemaCommon {}

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
