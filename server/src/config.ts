import env from "env-var";

const publicUrl = env.get("PUBLIC_URL").required().asString();
const environement = env.get("ENV").required().asEnum(["local", "recette", "production", "preview", "test"]);

const config = {
  productName: env.get("PUBLIC_PRODUCT_NAME").required().asString(),
  port: env.get("SERVER_PORT").required().asPortNumber(),
  version: env.get("PUBLIC_VERSION").required().asString(),
  env: environement,
  publicUrl,
  email: env.get("EMAIL").required().asString(),
  email_from: "Mission Apprentissage",
  apiPublicUrl: environement === "local" ? "http://localhost:5002/api" : `${publicUrl}/api`,
  mongodb: {
    uri: env.get("MONGODB_URI").required().asString(),
  },
  log: {
    type: env.get("LOG_TYPE").required().asString(),
    level: env.get("LOG_LEVEL").required().asString(),
  },
  session: {
    secret: env.get("SESSION_SECRET").required().asString(),
    cookieName: "api_session",
    cookie: {
      maxAge: 30 * 24 * 3600000,
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: env.get("SESSION_COOKIE_SECURE").default("true").asBool(),
    },
  },
  api_key: {
    // 1 an
    expiresIn: 365 * 24 * 60 * 60 * 1000,
  },
  auth: {
    user: {
      jwtSecret: env.get("AUTH_USER_JWT_SECRET").required().asString(),
      // 1 mois: meme valeur que le cookie de session
      expiresIn: 30 * 24 * 3600,
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
  api: {
    alternance: {
      public_cert: env.get("API_TOKEN_PUBLIC_KEY").required().asString(),
      private_key: env.get("API_TOKEN_PRIVATE_KEY").required().asString(),
    },
    acce: {
      username: env.get("API_ACCE_USERNAME").required().asString(),
      password: env.get("API_ACCE_PASSWORD").required().asString(),
    },
    referentielOnisep: {
      endpoint: "https://referentiel.apprentissage.onisep.fr/api/v1",
    },
    geo: {
      endpoint: "https://geo.api.gouv.fr",
    },
    unml: {
      endpoint: "https://api.unml.info",
    },
    insee: {
      endpoint: "https://api.insee.fr",
      token: env.get("API_INSEE_TOKEN").required().asString(),
    },
    enseignementSup: {
      endpoint: "https://data.enseignementsup-recherche.gouv.fr",
    },
    catalogue: {
      baseurl: "https://catalogue-apprentissage.intercariforef.org",
    },
    catalogueEducatif: {
      baseurl: "https://catalogue.apprentissage.education.gouv.fr",
      username: env.get("API_CATALOGUE_EDUCATIF_USERNAME").required().asString(),
      password: env.get("API_CATALOGUE_EDUCATIF_PASSWORD").required().asString(),
    },
    entreprise: {
      baseurl: "https://entreprise.api.gouv.fr/v3",
      key: env.get("API_ENTREPRISE_KEY").required().asString(),
      defaultRecipient: "13002526500013", // Siret DINUM
      object: "Consolidation des données",
      context: "MNA",
    },
    bal: {
      baseurl: env.get("API_BAL_URL").required().asString(),
      apiKey: env.get("API_BAL_API_KEY").required().asString(),
    },
    lba: {
      endpoint: env.get("LBA_API_ENDPOINT").required().asString(),
    },
    kit_apprentissage: {
      endpoint: "https://api-kit-apprentissage.intercariforef.org",
      token: env.get("API_KIT_APPRENTISSAGE_TOKEN").required().asString(),
    },
  },
};

export default config;
