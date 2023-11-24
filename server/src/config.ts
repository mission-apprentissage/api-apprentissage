import env from "env-var";

const config = {
  productName: env.get("PRODUCT_NAME").required().asString(),
  port: env.get("SERVER_PORT").required().asPortNumber(),
  version: env.get("PUBLIC_VERSION").required().asString(),
  env: env.get("ENV").required().asEnum(["local", "recette", "production", "preview", "test"]),
  publicUrl: env.get("PUBLIC_URL").required().asString(),
  email: env.get("EMAIL").required().asString(),
  email_from: "Mission Apprentissage",
  mongodb: {
    uri: env.get("MONGODB_URI").required().asString(),
  },
  log: {
    type: env.get("LOG_TYPE").required().asString(),
    level: env.get("LOG_LEVEL").required().asString(),
  },
  session: {
    secret: env.get("SESSION_SECRET").required().asString(),
    cookieName: "tmpl_session",
    cookie: {
      maxAge: 30 * 24 * 3600000,
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: env.get("SESSION_COOKIE_SECURE").default("true").asBool(),
    },
  },
  auth: {
    user: {
      jwtSecret: env.get("AUTH_USER_JWT_SECRET").required().asString(),
      expiresIn: "7d",
    },
    resetPasswordToken: {
      jwtSecret: env.get("AUTH_PASSWORD_JWT_SECRET").required().asString(),
      expiresIn: "1h",
    },
    hashRounds: env.get("AUTH_HASH_ROUNDS").required().asIntPositive(),
  },
  smtp: {
    host: env.get("SMTP_HOST").required().asString(),
    port: env.get("SMTP_PORT").required().asString(),
    secure: env.get("SMTP_SECURE").asBool(),
    webhookKey: env.get("SMTP_WEBHOOK_KEY").required().asString(),
    auth: {
      user: env.get("SMTP_AUTH_USER").required().asString(),
      pass: env.get("SMTP_AUTH_PASS").required().asString(),
    },
  },
  disable_processors: env.get("DISABLE_PROCESSORS").default("false").asBool(),
};

export default config;
