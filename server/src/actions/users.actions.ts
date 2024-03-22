import { ObjectId } from "mongodb";
import { IUser, IUserCreate } from "shared/models/user.model";

import { getDbCollection } from "@/services/mongodb/mongodbService";

import { generateKey, generateSecretHash, hashPassword } from "../utils/cryptoUtils";
import { createUserTokenSimple } from "../utils/jwtUtils";

export const createUser = async (data: IUserCreate): Promise<IUser> => {
  const _id = new ObjectId();

  const password = hashPassword(data.password);
  const now = new Date();
  const user: IUser = {
    ...data,
    _id,
    password,
    api_keys: [] as IUser["api_keys"],
    updated_at: now,
    created_at: now,
  };

  await getDbCollection("users").insertOne(user);

  return user;
};

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
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      },
    }
  );

  const token = createUserTokenSimple({
    payload: { _id: user._id, api_key: generatedKey },
    expiresIn: "365d",
  });

  return token;
};
