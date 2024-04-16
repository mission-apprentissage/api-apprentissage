import { ObjectId } from "mongodb";
import { IUser } from "shared/models/user.model";

import { getDbCollection } from "@/services/mongodb/mongodbService";

import config from "../config";
import { generateKey, generateSecretHash } from "../utils/cryptoUtils";
import { createUserTokenSimple } from "../utils/jwtUtils";

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

export const generateApiKey = async (user: IUser) => {
  const generatedKey = generateKey();
  const secretHash = generateSecretHash(generatedKey);

  await getDbCollection("users").findOneAndUpdate(
    {
      email: user.email,
    },
    {
      $set: { updated_at: new Date() },
      $push: {
        api_keys: {
          _id: new ObjectId(),
          name: null,
          key: secretHash,
          last_used_at: null,
          expires_at: new Date(Date.now() + config.api_key.expiresIn),
        },
      },
    }
  );

  const token = createUserTokenSimple({
    payload: { _id: user._id, api_key: generatedKey },
    expiresIn: config.api_key.expiresIn / 1_000,
  });

  return token;
};
