import { internal, unauthorized } from "@hapi/boom";
import { captureException } from "@sentry/node";
import type { PathParam, QueryString } from "api-alternance-sdk/internal";
import type { FastifyRequest } from "fastify";
import type { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import type { IApiKey, IUser } from "shared/models/user.model";
import type { IAccessToken, ISecuredRouteSchema, WithSecurityScheme } from "shared/routes/common.routes";
import type { UserWithType } from "shared/security/permissions";
import { assertUnreachable } from "shared/utils/assertUnreachable";

import { authCookieSession } from "@/actions/sessions.actions.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { compareKeys } from "@/utils/cryptoUtils.js";
import { decodeToken } from "@/utils/jwtUtils.js";

import { parseAccessToken } from "./accessTokenService.js";

export type IUserWithType = UserWithType<"token", IAccessToken> | UserWithType<"user", IUser>;

declare module "fastify" {
  interface FastifyRequest {
    user?: null | IUserWithType;
    api_key?: IApiKey | null;
  }
}

type AuthenticatedUser<AuthScheme extends WithSecurityScheme["securityScheme"]["auth"]> =
  AuthScheme extends "access-token"
    ? UserWithType<"token", IAccessToken>
    : AuthScheme extends "api-key" | "cookie-session"
      ? UserWithType<"user", IUser>
      : never;

export const getUserFromRequest = <S extends WithSecurityScheme>(
  req: Pick<FastifyRequest, "user">,
  _schema: S
): AuthenticatedUser<S["securityScheme"]["auth"]>["value"] => {
  if (!req.user) {
    throw internal("User should be authenticated");
  }

  return req.user.value as AuthenticatedUser<S["securityScheme"]["auth"]>["value"];
};

async function authApiKey(req: FastifyRequest): Promise<UserWithType<"user", IUser> | null> {
  const token = extractBearerTokenFromHeader(req);

  if (!token) {
    return null;
  }

  try {
    const { _id, api_key } = decodeToken(token) as JwtPayload;

    const user = await getDbCollection("users").findOne({ _id: new ObjectId(`${_id}`) });

    const savedKey = user?.api_keys.find((key) => compareKeys(key.key, api_key));

    if (!savedKey) {
      return null;
    }

    const now = new Date();
    const updatedUser = await getDbCollection("users").findOneAndUpdate(
      { "api_keys._id": savedKey._id },
      {
        $set: {
          "api_keys.$.last_used_at": now,
          updated_at: now,
        },
      },
      { returnDocument: "after" }
    );

    req.api_key = updatedUser?.api_keys.find((key) => key._id.equals(savedKey._id)) ?? null;

    return updatedUser === null ? null : { type: "user", value: updatedUser };
  } catch (error) {
    captureException(error);
    return null;
  }
}

const bearerRegex = /^bearer\s+(\S+)$/i;
function extractBearerTokenFromHeader(req: FastifyRequest): null | string {
  const { authorization } = req.headers;

  if (!authorization) {
    return null;
  }

  const matches = authorization.match(bearerRegex);

  return matches === null ? null : matches[1];
}

function extractTokenFromQuery(req: FastifyRequest): null | string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req.query as any)?.token ?? null;
}

async function authAccessToken<S extends ISecuredRouteSchema>(
  req: FastifyRequest,
  schema: S
): Promise<UserWithType<"token", IAccessToken> | null> {
  const token = parseAccessToken(
    extractBearerTokenFromHeader(req) ?? extractTokenFromQuery(req),
    schema,
    req.params as PathParam,
    req.query as QueryString
  );

  if (token === null) {
    return null;
  }

  return token ? { type: "token", value: token } : null;
}

export async function authenticationMiddleware<S extends ISecuredRouteSchema>(schema: S, req: FastifyRequest) {
  if (!schema.securityScheme) {
    throw internal("Missing securityScheme");
  }

  const securityScheme = schema.securityScheme;

  switch (securityScheme.auth) {
    case "cookie-session":
      req.user = await authCookieSession(req);
      if (!req.user) {
        throw unauthorized("Vous devez être connecté pour accéder à cette ressource");
      }
      break;
    case "api-key":
      req.user = await authApiKey(req);
      if (!req.user) {
        throw unauthorized("Vous devez fournir une clé d'API valide pour accéder à cette ressource");
      }
      break;
    case "access-token":
      req.user = await authAccessToken(req, schema);
      if (!req.user) {
        throw unauthorized("Le lien de connexion pour accéder à cette ressource est invalide");
      }
      break;
    default:
      assertUnreachable(securityScheme.auth);
  }

  if (!req.user) {
    throw unauthorized("Vous devez être connecté pour accéder à cette ressource");
  }
}
