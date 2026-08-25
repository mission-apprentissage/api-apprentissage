import { ObjectId } from "bson"
import type { z } from "zod/v4-mini"

import type { IApiKey, IUser } from "../user.model.js"
import { zUser } from "../user.model.js"

type IApiKeyFixtureInput = Partial<IApiKey>

export function generateApiKeyFixture(data?: IApiKeyFixtureInput): IApiKey {
  return {
    _id: new ObjectId(),
    name: "ma-cle",
    key: "value",
    env: "production",
    last_used_at: null,
    expires_at: new Date("2025-03-21T00:00:00Z"),
    created_at: new Date("2024-03-21T00:00:00Z"),
    expiration_warning_sent: null,
    ...data,
  }
}

type IUserFixtureInput = Partial<IUser>

export function generateUserFixture(data?: IUserFixtureInput): IUser {
  const input: z.input<typeof zUser> = {
    _id: new ObjectId(),
    email: "user@exemple.fr",
    organisation: null,
    is_admin: false,
    api_keys: [],
    updated_at: new Date("2024-03-21T00:00:00Z"),
    created_at: new Date("2024-03-21T00:00:00Z"),
    type: "autre",
    activite: null,
    objectif: "fiabiliser",
    cas_usage: null,
    cgu_accepted_at: new Date("2024-03-21T00:00:00Z"),
    ...data,
  }

  return zUser.parse(input)
}
