import type { IApiRoutesDef } from "api-alternance-sdk";
import { zOrganisation } from "api-alternance-sdk";
import type { Jsonify } from "type-fest";
import { z } from "zod/v4-mini";

import { zUser, zUserPublic } from "../../models/user.model.js";
import { ZReqHeadersAuthorization, ZResOk } from "../common.routes.js";

const zSession = z.object({
  user: zUserPublic,
  organisation: z.nullable(zOrganisation),
});

export type ISession = z.output<typeof zSession>;
export type ISessionJson = Jsonify<ISession>;

export const zAuthRoutes = {
  get: {
    "/_private/auth/logout": {
      method: "get",
      path: "/_private/auth/logout",
      response: {
        "200": ZResOk,
      },
      securityScheme: null,
    },
    "/_private/auth/session": {
      method: "get",
      path: "/_private/auth/session",
      response: {
        "200": zSession,
      },
      headers: ZReqHeadersAuthorization,
      securityScheme: {
        auth: "cookie-session",
        access: null,
        ressources: {},
      },
    },
  },
  post: {
    "/_private/auth/register-feedback": {
      method: "post",
      path: "/_private/auth/register-feedback",
      body: z.object({
        comment: z.string(),
      }),
      response: {
        "200": z.object({ success: z.literal(true) }),
      },
      securityScheme: {
        auth: "access-token",
        access: null,
        ressources: {},
      },
    },
    "/_private/auth/register": {
      method: "post",
      path: "/_private/auth/register",
      body: z.extend(
        z.pick(zUser, {
          type: true,
          activite: true,
          objectif: true,
          cas_usage: true,
        }),
        {
          cgu: z.literal(true),
        }
      ),
      response: {
        "200": zSession,
      },
      securityScheme: {
        auth: "access-token",
        access: null,
        ressources: {},
      },
    },
    "/_private/auth/login-request": {
      method: "post",
      path: "/_private/auth/login-request",
      body: z.object({
        email: zUser.shape.email,
      }),
      response: {
        "200": z.object({
          success: z.literal(true),
        }),
      },
      securityScheme: null,
    },
    "/_private/auth/login": {
      method: "post",
      path: "/_private/auth/login",
      body: z.unknown(),
      response: {
        "200": zSession,
      },
      securityScheme: {
        auth: "access-token",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;

export interface IStatus {
  error?: boolean;
  message?: string;
}
