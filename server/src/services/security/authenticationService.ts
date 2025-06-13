import { internal, unauthorized } from "@hapi/boom";
import { captureException } from "@sentry/node";
import type { ISecuredRouteSchema, WithSecurityScheme } from "api-alternance-sdk";
import type { PathParam, QueryString, UserWithType } from "api-alternance-sdk/internal";
import type { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import type { IOrganisationInternal } from "shared/models/organisation.model";
import type { IApiKey, IUser } from "shared/models/user.model";
import type { IAccessToken } from "shared/routes/common.routes";
import { assertUnreachable } from "shared/utils/assertUnreachable";

import { parseAccessToken } from "./accessTokenService.js";
import { authCookieSession } from "@/actions/sessions.actions.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { compareKeys } from "@/utils/cryptoUtils.js";
import { decodeToken } from "@/utils/jwtUtils.js";

export type IUserWithType = UserWithType<"token", IAccessToken> | UserWithType<"user", IUser>;

declare module "fastify" {
  interface FastifyRequest {
    user?: null | IUserWithType;
    organisation?: null | IOrganisationInternal;
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

function findApiKey(api_keys: IApiKey[], value: string) {
  const key = api_keys.find((k) => k.key === value);

  if (key) {
    return key;
  }

  // Support legacy token emitted using hashed key
  return api_keys.find((k) => k.key.includes(".") && compareKeys(k.key, value));
}

async function authApiKey(req: FastifyRequest): Promise<UserWithType<"user", IUser> | null> {
  const token = extractBearerTokenFromHeader(req);

  if (!token) {
    return null;
  }

  try {
    const { _id, api_key } = await decodeToken(token);

    const user = await getDbCollection("users").findOne({ _id: new ObjectId(`${_id}`) });

    const savedKey = findApiKey(user?.api_keys ?? [], api_key);

    if (!savedKey || user === null) {
      throw unauthorized("La clé d'API fournie a été révoquée");
    }

    req.api_key = { ...savedKey, key: api_key };

    if (savedKey.key === api_key) {
      return { type: "user", value: user };
    }

    const now = new Date();

    await getDbCollection("users").updateOne(
      { "api_keys._id": savedKey._id },
      {
        $set: {
          // Keep the key value to migrate from hashed key to plain key
          "api_keys.$.key": api_key,
          updated_at: now,
        },
      }
    );

    return {
      type: "user",
      value: {
        ...user,
        updated_at: now,
        api_keys: user.api_keys.map((k) => (k._id === savedKey._id ? { ...k, key: api_key } : k)),
      },
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error instanceof jwt.TokenExpiredError) {
        throw unauthorized("La clé d'API a expirée");
      }

      throw unauthorized("Impossible de déchiffrer la clé d'API");
    }

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

  if (!matches) {
    throw unauthorized("Le header Authorization doit être de la forme 'Bearer <token>'");
  }

  return matches[1];
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

async function getOrganisation(user: IUserWithType | null | undefined): Promise<IOrganisationInternal | null> {
  if (user == null) return null;
  const organisationName = user.type === "token" ? user.value.identity.organisation : user.value.organisation;
  if (organisationName === null) return null;

  return getDbCollection("organisations").findOne({ nom: organisationName });
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

  req.organisation = await getOrganisation(req.user);
}
