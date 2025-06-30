import type { SchemaWithSecurity } from "api-alternance-sdk";
import type { Jsonify } from "type-fest";
import { z } from "zod/v4-mini";
import type { $ZodObject } from "zod/v4/core";

export const ZResOk = z.object({});

export type { IResError, IResErrorJson } from "api-alternance-sdk";

export const ZReqParamsSearchPagination = z.object({
  page: z.optional(z.coerce.number().check(z.int(), z.gte(0))),
  limit: z.optional(z.coerce.number().check(z.int(), z.gte(0))),
  q: z.optional(z.string()),
});
export type IReqParamsSearchPagination = z.input<typeof ZReqParamsSearchPagination>;

export const ZReqHeadersAuthorization = z.object({
  Authorization: z.optional(z.string()),
});

export type IAccessTokenScope<S extends SchemaWithSecurity> = {
  path: S["path"];
  method: S["method"];
  options:
    | "all"
    | {
        params: S["params"] extends $ZodObject ? Partial<Jsonify<z.input<S["params"]>>> : undefined;
        querystring: S["querystring"] extends $ZodObject ? Partial<Jsonify<z.input<S["querystring"]>>> : undefined;
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
