import type { AnyZodObject, ZodEffects, ZodType, ZodUnknown } from "zod";

import type { AccessPermission, AccessRessouces } from "./security/permissions.js";

export interface IApiRouteSchemaCommon {
  path: string;
  querystring?: AnyZodObject | ZodUnknown | ZodEffects<AnyZodObject>;
  headers?: AnyZodObject;
  params?: AnyZodObject;
  response: { [statuscode: `${1 | 2 | 3 | 4 | 5}${string}`]: ZodType };
  securityScheme: SecurityScheme | null;
}

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

export interface IApiRouteSchemaGet extends IApiRouteSchemaCommon {
  method: "get";
}

export interface IApiRouteSchemaWrite extends IApiRouteSchemaCommon {
  method: "post" | "put" | "patch" | "delete";
  body?: ZodType;
}

export type IApiRouteSchema = IApiRouteSchemaGet | IApiRouteSchemaWrite;

export type IApiRoutesDef = {
  get?: Record<string, IApiRouteSchemaGet>;
  post?: Record<string, IApiRouteSchemaWrite>;
  put?: Record<string, IApiRouteSchemaWrite>;
  delete?: Record<string, IApiRouteSchemaWrite>;
  patch?: Record<string, IApiRouteSchemaWrite>;
};

export type WithSecurityScheme = {
  securityScheme: SecurityScheme;
};

export type ISecuredRouteSchema = IApiRouteSchema & WithSecurityScheme;

export type SchemaWithSecurity = Pick<IApiRouteSchema, "method" | "path" | "params" | "querystring"> &
  WithSecurityScheme;
