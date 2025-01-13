import { internal } from "@hapi/boom";
import type { UserWithType } from "api-alternance-sdk/internal";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { Filter, FindOptions } from "mongodb";
import { ObjectId } from "mongodb";
import type { ISession } from "shared/models/session.model";
import type { IUser } from "shared/models/user.model";

import config from "@/config.js";
import { withCause } from "@/services/errors/withCause.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export async function authCookieSession(req: FastifyRequest): Promise<UserWithType<"user", IUser> | null> {
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
    if (error instanceof jwt.JsonWebTokenError) {
      return null;
    }

    const err = internal("authCookieSession: error when verifying token");
    throw withCause(err, error);
  }
}

async function createSession(email: string) {
  const now = new Date();

  const session: ISession = {
    _id: new ObjectId(),
    email,
    updated_at: now,
    created_at: now,
    expires_at: new Date(now.getTime() + config.session.cookie.maxAge),
  };

  await getDbCollection("sessions").insertOne(session);

  return session;
}

async function getSession(filter: Filter<ISession>, options?: FindOptions): Promise<ISession | null> {
  return getDbCollection("sessions").findOne(filter, options);
}

async function deleteSession({ email }: { email: string }) {
  await getDbCollection("sessions").deleteMany({ email });
}

function createSessionToken(email: string) {
  return jwt.sign({ email }, config.auth.user.jwtSecret, {
    issuer: config.publicUrl,
    expiresIn: config.session.cookie.maxAge / 1_000,
    subject: email,
  });
}

async function startSession(email: string, res: FastifyReply) {
  const token = createSessionToken(email);
  await createSession(email);
  res.setCookie(config.session.cookieName, token, config.session.cookie);
}

async function stopSession(req: FastifyRequest, res: FastifyReply) {
  const user = await authCookieSession(req);
  if (user) {
    await deleteSession({ email: user.value.email });
  }

  res.clearCookie(config.session.cookieName, config.session.cookie);
}

export { getSession, startSession, stopSession, createSessionToken, createSession };
