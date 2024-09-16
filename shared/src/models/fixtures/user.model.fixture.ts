import { ObjectId } from "bson";
import type { z } from "zod";

import type { IUser } from "../user.model.js";
import { zUser } from "../user.model.js";

type IUserFixtureInput = Partial<IUser>;

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
  };

  return zUser.parse(input);
}
