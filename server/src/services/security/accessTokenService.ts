import { forbidden, internal } from "@hapi/boom";
import { captureException } from "@sentry/node";
import jwt from "jsonwebtoken";
import { PathParam, QueryString } from "shared/helpers/generateUri";
import { IUser } from "shared/models/user.model";
import { IRouteSchema, ISecuredRouteSchema, WithSecurityScheme } from "shared/routes/common.routes";
import { Jsonify } from "type-fest";
import { AnyZodObject, z } from "zod";

import config from "@/config";

// cf https://www.sistrix.com/ask-sistrix/technical-seo/site-structure/url-length-how-long-can-a-url-be
const INTERNET_EXPLORER_V10_MAX_LENGTH = 2083;
const OUTLOOK_URL_MAX_LENGTH = 8192;
const NGINX_URL_MAX_LENGTH = 4096;
const URL_MAX_LENGTH = Math.min(INTERNET_EXPLORER_V10_MAX_LENGTH, OUTLOOK_URL_MAX_LENGTH, NGINX_URL_MAX_LENGTH);
const TOKEN_MAX_LENGTH = URL_MAX_LENGTH - config.publicUrl.length;

export type SchemaWithSecurity = Pick<IRouteSchema, "method" | "path" | "params" | "querystring"> & WithSecurityScheme;

type IScope<S extends SchemaWithSecurity> = {
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

type IScopeParam<S extends SchemaWithSecurity> = Pick<IScope<S>, "options" | "resources"> & {
  schema: S;
};

export const generateScope = <Schema extends SchemaWithSecurity>(scope: IScopeParam<Schema>): IScope<Schema> => {
  const { schema, options, resources } = scope;

  const requiredResources = Object.keys(schema.securityScheme.ressources);
  const providedResources = new Set(Object.keys(resources));
  for (const requiredResource of requiredResources) {
    if (!providedResources.has(requiredResource)) {
      throw internal("generateScope: Missing resource", { scope, requiredResource });
    }
    providedResources.delete(requiredResource);
  }

  if (providedResources.size > 0) {
    throw internal("generateScope: Extra resources", { scope, extraResources: providedResources });
  }

  return { options, resources, path: schema.path, method: schema.method };
};

export type IAccessToken<S extends SchemaWithSecurity = SchemaWithSecurity> = {
  identity: {
    email: string;
  };
  scopes: ReadonlyArray<IScope<S>>;
};

export function generateAccessToken<S extends ISecuredRouteSchema>(
  user: IUser | IAccessToken["identity"],
  scopes: ReadonlyArray<IScope<S>>,
  options: { expiresIn?: string } = {}
): string {
  const identity: IAccessToken["identity"] = { email: user.email.toLowerCase() };

  const data: IAccessToken<S> = { identity, scopes };

  const token = jwt.sign(data, config.auth.user.jwtSecret, {
    expiresIn: options.expiresIn ?? config.auth.user.expiresIn,
    issuer: config.publicUrl,
  });

  if (token.length > TOKEN_MAX_LENGTH) {
    captureException(internal(`Token généré trop long : ${token.length}`));
  }
  return token;
}

export function getAccessTokenScope<S extends SchemaWithSecurity>(
  token: IAccessToken<S> | null,
  schema: Pick<S, "method" | "path">,
  params: PathParam | undefined,
  querystring: QueryString | undefined
): IScope<S> | null {
  return (
    token?.scopes.find((s) => {
      if (s.path !== schema.path || s.method !== schema.method) {
        return false;
      }

      if (s.options === "all") {
        return true;
      }

      if (s.options.params) {
        const requiredParams = s.options.params;
        for (const [key, requiredValue] of Object.entries(requiredParams)) {
          if (params?.[key] !== requiredValue) {
            return false;
          }
        }
      }

      if (s.options.querystring) {
        const requiredQuerystring = s.options.querystring;
        for (const [key, value] of Object.entries(requiredQuerystring)) {
          const requiredValues = Array.isArray(value) ? new Set(value) : new Set([value]);
          const inputValues = querystring?.[key] ?? [];

          if (Array.isArray(inputValues)) {
            for (const inputValue of inputValues) {
              requiredValues.delete(inputValue);
            }
          } else {
            requiredValues.delete(inputValues);
          }

          if (requiredValues.size > 0) {
            return false;
          }
        }
      }

      return true;
    }) ?? null
  );
}

export function parseAccessToken<S extends SchemaWithSecurity>(
  accessToken: null | string,
  schema: Pick<S, "method" | "path">,
  params: PathParam | undefined,
  querystring: QueryString | undefined
): IAccessToken<S> | null {
  if (!accessToken) {
    return null;
  }

  try {
    const data = jwt.verify(accessToken, config.auth.user.jwtSecret, {
      complete: true,
      issuer: config.publicUrl,
    });

    const token = data.payload as IAccessToken<S>;

    const scope = getAccessTokenScope(token, schema, params, querystring);

    if (!scope) {
      throw forbidden("Scope does not match");
    }

    return token;
  } catch (err) {
    const error = forbidden("Invalid Access Token");
    error.cause = err;
    throw error;
  }
}
