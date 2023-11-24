import jwt, { SignOptions } from "jsonwebtoken";
import { zRoutes } from "shared";
import { ITemplate, zTemplate } from "shared/models/email_event/email_templates";
import { IUser } from "shared/models/user.model";

import config from "@/config";

import { generateAccessToken, generateScope } from "../../security/accessTokenService";

interface ICreateTokenOptions {
  secret?: string;
  expiresIn?: string;
  payload?: string | Buffer | object;
}

type TokenType = "user" | "resetPasswordToken";

const createToken = (type: TokenType, subject: string | null = null, options: ICreateTokenOptions = {}) => {
  const defaults = config.auth[type];
  const secret = options.secret ?? defaults.jwtSecret;
  const expiresIn = options.expiresIn ?? defaults.expiresIn;
  const payload = options.payload ?? {};

  const opts: SignOptions = {
    issuer: config.productName,
    expiresIn: expiresIn,
  };
  if (subject) {
    opts.subject = subject;
  }
  return jwt.sign(payload, secret, opts);
};

export function createResetPasswordToken(user: IUser) {
  return generateAccessToken(user, [
    generateScope({
      schema: zRoutes.post["/auth/reset-password"],
      options: "all",
      resources: {},
    }),
  ]);
}

export function serializeEmailTemplate(template: ITemplate): string {
  // We do not set expiry as the result is not used as a token but as serialized data
  return jwt.sign(template, config.auth.user.jwtSecret, {
    issuer: config.productName,
  });
}

export function deserializeEmailTemplate(data: string): ITemplate {
  return zTemplate.parse(jwt.verify(data, config.auth.user.jwtSecret));
}

export function createUserTokenSimple(options = {}) {
  return createToken("user", null, options);
}

export const decodeToken = (token: string, type: TokenType = "user") => {
  return jwt.verify(token, config.auth[type].jwtSecret);
};
