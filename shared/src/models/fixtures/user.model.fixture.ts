import { ObjectId } from "bson";

import { IUser } from '../user.model.js';
import { getFixtureValue } from './fixture_helper.js';

type IUserFixtureInput = Partial<IUser>;

export function generateUserFixture(data?: IUserFixtureInput): IUser {
  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    email: getFixtureValue(data, "email", "user@exemple.fr"),
    is_admin: getFixtureValue(data, "is_admin", false),
    api_keys: getFixtureValue(data, "api_keys", []),
    updated_at: getFixtureValue(data, "updated_at", new Date("2024-03-21T00:00:00Z")),
    created_at: getFixtureValue(data, "created_at", new Date("2024-03-21T00:00:00Z")),
    type: getFixtureValue(data, "type", "autre"),
    activite: getFixtureValue(data, "activite", null),
    objectif: getFixtureValue(data, "objectif", "fiabiliser"),
    cas_usage: getFixtureValue(data, "cas_usage", null),
    cgu_accepted_at: getFixtureValue(data, "cgu_accepted_at", new Date("2024-03-21T00:00:00Z")),
  };
}
