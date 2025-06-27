import { ObjectId } from "mongodb";
import type { IApiKeyPrivate, IUser } from "shared/models/user.model";
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";

import config from "@/config.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { generateKey } from "@/utils/cryptoUtils.js";
import { createUserTokenSimple } from "@/utils/jwtUtils.js";

export const updateUser = async (email: IUser["email"], data: Partial<IUser>): Promise<void> => {
  await getDbCollection("users").findOneAndUpdate(
    {
      email,
    },
    {
      $set: { ...data, updated_at: new Date() },
    }
  );
};

export const generateApiKey = async (
  name: string,
  user: IUser
): Promise<IApiKeyPrivate & { value: string; key: string }> => {
  const now = new Date();
  const generatedKey = generateKey();

  const data: IUser["api_keys"][number] = {
    _id: new ObjectId(),
    name:
      name ||
      uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: "-",
      }),
    key: generatedKey,
    last_used_at: null,
    expires_at: new Date(now.getTime() + config.api_key.expiresIn),
    created_at: now,
    expiration_warning_sent: null,
  };

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
  );

  const token = await createUserTokenSimple({
    payload: { _id: user._id, api_key: generatedKey, organisation: user.organisation, email: user.email },
    expiresIn: `${config.api_key.expiresIn / 1_000}s`,
  });

  return {
    ...data,
    value: token,
  };
};

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
  );
}
