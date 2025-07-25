import { conflict } from "@hapi/boom";
import { ObjectId } from "mongodb";
import type { IBody, IPostRoutes } from "shared";
import { zRoutes } from "shared";
import type { IUser } from "shared/models/user.model";

import { sendEmail } from "@/services/mailer/mailer.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { generateAccessToken, generateScope } from "@/services/security/accessTokenService.js";

export async function generateRegisterToken(email: string): Promise<string> {
  // No need to provided organisation for register
  return generateAccessToken(
    { email, organisation: null },
    [
      generateScope({
        schema: zRoutes.post["/_private/auth/register"],
        options: "all",
        resources: {},
      }),
      generateScope({
        schema: zRoutes.post["/_private/auth/register-feedback"],
        options: "all",
        resources: {},
      }),
    ],
    { expiresIn: "30d" }
  );
}

async function sendRegisterEmail(email: string) {
  return sendEmail({
    name: "register",
    to: email,
    token: await generateRegisterToken(email),
  });
}

export async function generateMagicLinkToken(email: string, organisation: string | null): Promise<string> {
  return generateAccessToken(
    { email, organisation },
    [
      generateScope({
        schema: zRoutes.post["/_private/auth/login"],
        options: "all",
        resources: {},
      }),
    ],
    { expiresIn: "7d" }
  );
}

async function sendMagicLinkEmail(email: string, organisation: string | null) {
  return sendEmail({
    name: "magic-link",
    to: email,
    token: await generateMagicLinkToken(email, organisation),
  });
}

export async function sendRequestLoginEmail(email: string) {
  const user = await getDbCollection("users").findOne({ email });

  if (!user) {
    await sendRegisterEmail(email);
  } else {
    await sendMagicLinkEmail(email, user.organisation);
  }
}

export async function sendRegisterFeedbackEmail(
  from: string,
  data: IBody<IPostRoutes["/_private/auth/register-feedback"]>
) {
  await sendEmail({
    name: "register-feedback",
    to: "support_api@apprentissage.beta.gouv.fr",
    from,
    comment: data.comment,
  });
}

export async function registerUser(email: string, data: IBody<IPostRoutes["/_private/auth/register"]>): Promise<IUser> {
  const existingUser = await getDbCollection("users").findOne({ email });

  if (existingUser) {
    await sendMagicLinkEmail(email, existingUser.organisation);
    throw conflict(
      "Un compte associé à cet email existe déjà. Nous vous avons envoyé un lien de connexion, veuillez consulter vos emails."
    );
  }

  const now = new Date();
  const user = {
    _id: new ObjectId(),
    email,
    organisation: null,
    type: data.type,
    activite: data.activite,
    objectif: data.objectif,
    cas_usage: data.cas_usage,
    is_admin: false,
    api_keys: [],
    cgu_accepted_at: now,
    created_at: now,
    updated_at: now,
  };

  await getDbCollection("users").insertOne(user);

  return user;
}
