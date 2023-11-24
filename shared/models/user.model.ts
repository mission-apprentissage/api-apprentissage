import { Jsonify } from "type-fest";
import { z } from "zod";

import { IModelDescriptor, zObjectId } from "./common";

const collectionName = "users" as const;

const indexes: IModelDescriptor["indexes"] = [
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
    },
  ],
  [
    {
      email: "text",
    },
    {
      weights: {
        email: 10,
      },
      name: "search",
    },
  ],
];

export const zUser = z
  .object({
    _id: zObjectId,
    email: z.string().email().describe("Email de l'utilisateur"),
    password: z.string().describe("Mot de passe de l'utilisateur"),
    is_admin: z.boolean(),
    api_key: z.string().nullable().describe("Clé API"),
    api_key_used_at: z.date().nullable().describe("Date de dernière utilisation de la clé API"),
    updated_at: z.date().describe("Date de mise à jour en base de données"),
    created_at: z.date().describe("Date d'ajout en base de données"),
  })
  .strict();

export const zUserCreate = zUser
  .pick({
    email: true,
    password: true,
    is_admin: true,
  })
  .strict();

export const zUserPublic = z
  .object({
    _id: zObjectId,
    email: zUser.shape.email,
    is_admin: zUser.shape.is_admin,
    has_api_key: z.boolean(),
    api_key_used_at: zUser.shape.api_key_used_at,
    updated_at: zUser.shape.updated_at,
    created_at: zUser.shape.created_at,
  })
  .strict();

export type IUser = z.output<typeof zUser>;
export type IUserPublic = Jsonify<z.output<typeof zUserPublic>>;
export type IUserCreate = Jsonify<z.output<typeof zUserCreate>>;

export function toPublicUser(user: IUser): z.output<typeof zUserPublic> {
  return zUserPublic.parse({
    _id: user._id,
    email: user.email,
    is_admin: user.is_admin,
    has_api_key: Boolean(user.api_key),
    api_key_used_at: user.api_key_used_at,
    updated_at: user.updated_at,
    created_at: user.created_at,
  });
}

export default {
  zod: zUser,
  indexes,
  collectionName,
};
