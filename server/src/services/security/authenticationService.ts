import Boom from "@hapi/boom";
import { captureException } from "@sentry/node";
import { FastifyRequest } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { PathParam, QueryString } from "shared/helpers/generateUri";
import { IUser } from "shared/models/user.model";
import { ISecuredRouteSchema, WithSecurityScheme } from "shared/routes/common.routes";
import { UserWithType } from "shared/security/permissions";
import { assertUnreachable } from "shared/utils/assertUnreachable";

import config from "@/config";

import { getSession } from "../../actions/sessions.actions";
import { compareKeys } from "../../utils/cryptoUtils";
import { decodeToken } from "../../utils/jwtUtils";
import { getDbCollection } from "../mongodb/mongodbService";
import { IAccessToken, parseAccessToken } from "./accessTokenService";

export type IUserWithType = UserWithType<"token", IAccessToken> | UserWithType<"user", IUser>;

declare module "fastify" {
  interface FastifyRequest {
    user?: null | IUserWithType;
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
    throw Boom.internal("User should be authenticated");
  }

  return req.user.value as AuthenticatedUser<S["securityScheme"]["auth"]>["value"];
};

async function authCookieSession(req: FastifyRequest): Promise<UserWithType<"user", IUser> | null> {
  const token = req.cookies?.[config.session.cookieName];

  if (!token) {
    return null;
  }

  try {
    const { email } = jwt.verify(token, config.auth.user.jwtSecret) as JwtPayload;

    const session = await getSession({ email });

    if (!session) {
      return null;
    }

    const user = await getDbCollection("users").findOne({ email: email.toLowerCase() });

    return user ? { type: "user", value: user } : user;
  } catch (error) {
    captureException(error);
    return null;
  }
}

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

async function authAccessToken<S extends ISecuredRouteSchema>(
  req: FastifyRequest,
  schema: S
): Promise<UserWithType<"token", IAccessToken> | null> {
  const token = parseAccessToken(
    extractBearerTokenFromHeader(req),
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
    throw Boom.internal("Missing securityScheme");
  }

  const securityScheme = schema.securityScheme;

  switch (securityScheme.auth) {
    case "cookie-session":
      req.user = await authCookieSession(req);
      break;
    case "api-key":
      req.user = await authApiKey(req);
      break;
    case "access-token":
      req.user = await authAccessToken(req, schema);
      break;
    default:
      assertUnreachable(securityScheme.auth);
  }

  if (!req.user) {
    throw Boom.unauthorized();
  }
}
