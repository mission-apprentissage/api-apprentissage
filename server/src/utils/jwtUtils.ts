import { internal } from "@hapi/boom"
import type { JWTPayload } from "jose"
import { jwtVerify, SignJWT } from "jose"
import type { ITemplate } from "shared/models/email_event/email_templates"
import { zTemplate } from "shared/models/email_event/email_templates"
import config from "@/config.js"

interface ICreateTokenOptions {
  expiresIn: string | Date
  payload: JWTPayload
}

const secret = new TextEncoder().encode(config.auth.user.jwtSecret)

// Tous nos jetons sont signés en HS256 avec `secret`. L'épinglage est obligatoire côté
// vérification : sans lui, jose atteint le contrôle de type de clé et lève un `TypeError`
// (et non une `JOSEError`) dès qu'un appelant présente un jeton signé en asymétrique.
const JWT_ALGORITHM = "HS256"

export async function serializeEmailTemplate(template: ITemplate): Promise<string> {
  // We do not set expiry as the result is not used as a token but as serialized data
  return new SignJWT(JSON.parse(JSON.stringify(template))).setProtectedHeader({ alg: JWT_ALGORITHM }).setIssuedAt().setIssuer(config.productName).sign(secret)
}

export async function deserializeEmailTemplate(data: string): Promise<ITemplate> {
  const { payload } = await jwtVerify(data, secret, { algorithms: [JWT_ALGORITHM] })
  return zTemplate.parse(payload)
}

export async function createUserTokenSimple(options: ICreateTokenOptions) {
  const { payload, expiresIn } = options

  if (secret.length < 32) {
    throw internal("JWT secret must be at least 32 characters long")
  }

  return new SignJWT(JSON.parse(JSON.stringify(payload)))
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuer(config.productName)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function decodeToken(token: string): Promise<JWTPayload> {
  const result = await jwtVerify(token, secret, { algorithms: [JWT_ALGORITHM] })
  return result.payload
}
