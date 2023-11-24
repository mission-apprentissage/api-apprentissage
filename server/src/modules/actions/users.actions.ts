import { ObjectId } from "mongodb";
import { IUser, IUserCreate } from "shared/models/user.model";

import { getDbCollection } from "@/common/utils/mongodbUtils";

import { generateKey, generateSecretHash } from "../../common/utils/cryptoUtils";
import { createUserTokenSimple } from "../../common/utils/jwtUtils";
import { hashPassword } from "../server/utils/password.utils";

export const createUser = async (data: IUserCreate) => {
  const _id = new ObjectId();

  const password = hashPassword(data.password);
  const now = new Date();
  const user: IUser = {
    ...data,
    _id,
    password,
    api_key: null,
    api_key_used_at: null,
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

  await updateUser(user.email, { api_key: secretHash, api_key_used_at: null });

  const token = createUserTokenSimple({
    payload: { _id: user._id, api_key: generatedKey },
    expiresIn: "365d",
  });

  return token;
};
