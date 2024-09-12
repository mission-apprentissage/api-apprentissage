import type { Jsonify } from "type-fest";
import { z } from "zod";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectId } from "./common.js";

const collectionName = "users" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ email: 1 }, { unique: true }],
  [
    {
      email: "text",
    },
    {
      name: "email_text",
      default_language: "french",
      collation: {
        locale: "simple",
        strength: 1,
      },
      weights: {
        email: 10,
      },
    },
  ],
  [{ "api_keys._id": 1 }, {}],
  [{ organisation: 1 }, {}],
];

export const zApiKey = z.object({
  _id: zObjectId,
  name: z.string().nullable(),
  key: z.string(),
  last_used_at: z.date().nullable(),
  expires_at: z.date(),
  created_at: z.date(),
});

export type IApiKey = z.output<typeof zApiKey>;

export const zApiKeyPrivate = zApiKey.omit({ key: true }).extend({
  value: z.string().nullable(),
});

export type IApiKeyPrivate = z.output<typeof zApiKeyPrivate>;
export type IApiKeyPrivateJson = Jsonify<IApiKeyPrivate>;

export const zUser = z.object({
  _id: zObjectId,
  organisation: z.string().nullable(),
  email: z.string().email().describe("Email de l'utilisateur").toLowerCase(),
  type: z.enum([
    "operateur_public",
    "organisme_formation",
    "entreprise",
    "editeur_logiciel",
    "organisme_financeur",
    "apprenant",
    "mission_apprentissage",
    "autre",
  ]),
  activite: z
    .string()
    .trim()
    .nullable()
    .transform((v) => v || null),
  objectif: z.enum(["fiabiliser", "concevoir"]).nullable(),
  cas_usage: z
    .string()
    .trim()
    .nullable()
    .transform((v) => v || null),
  cgu_accepted_at: z.date(),
  is_admin: z.boolean(),
  api_keys: z.array(zApiKey),
  updated_at: z.date().describe("Date de mise à jour en base de données"),
  created_at: z.date().describe("Date d'ajout en base de données"),
});

export const zUserCreate = zUser.pick({
  email: true,
  is_admin: true,
});

export const zUserPublic = z.object({
  _id: zObjectId,
  email: zUser.shape.email,
  organisation: z.string().nullable(),
  is_admin: zUser.shape.is_admin,
  has_api_key: z.boolean(),
  api_key_used_at: z.date().nullable(),
  updated_at: zUser.shape.updated_at,
  created_at: zUser.shape.created_at,
});

export const zUserAdminView = zUser
  .pick({
    _id: true,
    email: true,
    organisation: true,
    is_admin: true,
    type: true,
    activite: true,
    objectif: true,
    cas_usage: true,
    cgu_accepted_at: true,
    updated_at: true,
    created_at: true,
  })
  .extend({
    api_keys: z.array(zApiKey.omit({ key: true })),
  });

export const zUserAdminUpdate = zUserAdminView
  .pick({
    email: true,
    is_admin: true,
    organisation: true,
    type: true,
  })
  .partial();

export type IUser = z.output<typeof zUser>;
export type IUserPublic = Jsonify<z.output<typeof zUserPublic>>;
export type IUserCreate = Jsonify<z.output<typeof zUserCreate>>;
export type IUserAdminView = z.output<typeof zUserAdminView>;
export type IUserAdminUpdate = z.output<typeof zUserAdminUpdate>;

export function toPublicUser(user: IUser): z.output<typeof zUserPublic> {
  return zUserPublic.parse({
    _id: user._id,
    email: user.email,
    organisation: user.organisation,
    is_admin: user.is_admin,
    has_api_key: user.api_keys.length > 0,
    api_key_used_at: user.api_keys.reduce<Date | null>((acc, key) => {
      if (acc === null) return key.last_used_at;
      if (key.last_used_at === null) return acc;
      return acc.getTime() > key.last_used_at.getTime() ? acc : key.last_used_at;
    }, null),
    updated_at: user.updated_at,
    created_at: user.created_at,
  });
}

export default {
  zod: zUser,
  indexes,
  collectionName,
};
