import { z } from "zod";

import { zUser, zUserPublic } from "../../models/user.model.js";
import { IRoutesDef, ZReqHeadersAuthorization, ZResOk } from "../common.routes.js";

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
        "200": zUserPublic,
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
      body: z
        .object({
          comment: z.string(),
        })
        .strict(),
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
      body: zUser
        .pick({
          type: true,
          activite: true,
          objectif: true,
          cas_usage: true,
        })
        .extend({
          cgu: z.literal(true),
        })
        .strict(),
      response: {
        "200": zUserPublic,
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
      body: z
        .object({
          email: zUser.shape.email,
        })
        .strict(),
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
        "200": zUserPublic,
      },
      securityScheme: {
        auth: "access-token",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;

export interface IStatus {
  error?: boolean;
  message?: string;
}
