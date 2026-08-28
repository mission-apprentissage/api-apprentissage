import { ObjectId } from "mongodb"
import type { IOrganisationInternal } from "shared/models/organisation.model"
import type { IApiKeyEnv, IApiKeyPrivate, IUser } from "shared/models/user.model"
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator"

import config from "@/config.js"
import { getDbCollection } from "@/services/mongodb/mongodbService.js"
import { getApiKeyHabilitations } from "@/services/security/authorisationService.js"
import { generateKey } from "@/utils/cryptoUtils.js"
import { createUserTokenSimple } from "@/utils/jwtUtils.js"

export const updateUser = async (email: IUser["email"], data: Partial<IUser>): Promise<void> => {
  await getDbCollection("users").findOneAndUpdate(
    {
      email,
    },
    {
      $set: { ...data, updated_at: new Date() },
    }
  )
}

export const generateApiKey = async (name: string, env: IApiKeyEnv, user: IUser): Promise<IApiKeyPrivate & { value: string; key: string }> => {
  const now = new Date()
  const generatedKey = generateKey()

  const data: IUser["api_keys"][number] = {
    _id: new ObjectId(),
    name:
      name ||
      uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: "-",
      }),
    key: generatedKey,
    env,
    last_used_at: null,
    expires_at: new Date(now.getTime() + config.api_key.expiresIn),
    created_at: now,
    expiration_warning_sent: null,
  }

  await getDbCollection("users").findOneAndUpdate(
    {
      _id: user._id,
    },
    {
      $set: { updated_at: new Date() },
      $push: {
        api_keys: data,
      },
    }
  )

  return {
    ...data,
    value: await createApiKeyToken(user, data),
    habilitations: getApiKeyHabilitations(user, await getUserOrganisation(user), env),
  }
}

// Le claim `env` est informatif (debug/support) : la source de vérité à l'authentification reste la clé en base
function createApiKeyToken(user: IUser, data: IUser["api_keys"][number]): Promise<string> {
  return createUserTokenSimple({
    payload: { _id: user._id, api_key: data.key, organisation: user.organisation, email: user.email, env: data.env },
    expiresIn: data.expires_at,
  })
}

async function getUserOrganisation(user: IUser): Promise<IOrganisationInternal | null> {
  return user.organisation === null ? null : await getDbCollection("organisations").findOne({ nom: user.organisation })
}

async function addTokenValue(user: IUser, organisation: IOrganisationInternal | null, data: IUser["api_keys"][number]): Promise<IApiKeyPrivate> {
  const habilitations = getApiKeyHabilitations(user, organisation, data.env)

  if (data.expires_at.getTime() < Date.now()) {
    return { ...data, value: null, habilitations }
  }

  return {
    ...data,
    value: await createApiKeyToken(user, data),
    habilitations,
  }
}

// L'organisation est chargée une seule fois pour toutes les clés : les habilitations d'une clé
// production en dépendent, et elles sont identiques d'une clé à l'autre à environnement égal
export async function listUserApiKeys(user: IUser): Promise<IApiKeyPrivate[]> {
  const organisation = await getUserOrganisation(user)

  return Promise.all(user.api_keys.map((key) => addTokenValue(user, organisation, key)))
}

export async function deleteApiKey(id: ObjectId, user: IUser) {
  await getDbCollection("users").findOneAndUpdate(
    {
      _id: user._id,
    },
    {
      $set: { updated_at: new Date() },
      $pull: {
        api_keys: { _id: id },
      },
    }
  )
}
