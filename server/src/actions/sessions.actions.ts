import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { Filter, FindOptions, ObjectId } from "mongodb";
import { ISession } from "shared/models/session.model";

import { getDbCollection } from "@/services/mongodb/mongodbService";

import config from "../config";

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

async function deleteSession(token: string) {
  await getDbCollection("sessions").deleteMany({ token });
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
  const token = req.cookies[config.session.cookieName];

  if (token) {
    await deleteSession(token);
  }

  res.clearCookie(config.session.cookieName, config.session.cookie);
}

export { getSession, startSession, stopSession, createSessionToken, createSession };
