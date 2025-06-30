import { internal } from "@hapi/boom";
import type { ITemplate } from "shared/models/email_event/email_templates";
import { zTemplate } from "shared/models/email_event/email_templates";

import { jwtVerify, SignJWT } from "jose";
import type { JWTPayload } from "jose";
import config from "@/config.js";

interface ICreateTokenOptions {
  expiresIn: string;
  payload: JWTPayload;
}

const secret = new TextEncoder().encode(config.auth.user.jwtSecret);

export async function serializeEmailTemplate(template: ITemplate): Promise<string> {
  // We do not set expiry as the result is not used as a token but as serialized data
  return new SignJWT(JSON.parse(JSON.stringify(template)))
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(config.productName)
    .sign(secret);
}

export function deserializeEmailTemplate(data: string): ITemplate {
  return zTemplate.parse(jwtVerify(data, secret));
}

export async function createUserTokenSimple(options: ICreateTokenOptions) {
  const { payload, expiresIn } = options;

  if (secret.length < 32) {
    throw internal("JWT secret must be at least 32 characters long");
  }

  return new SignJWT(JSON.parse(JSON.stringify(payload)))
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(config.productName)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function decodeToken(token: string): Promise<JWTPayload> {
  const result = await jwtVerify(token, secret);
  return result.payload;
}
