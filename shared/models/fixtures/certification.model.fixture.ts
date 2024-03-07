import { ObjectId } from "bson";

import { ICertification } from "../certification.model";
import { getFixtureValue } from "./fixture_helper";

export function generateCertificationFixture(data?: Partial<ICertification>): ICertification {
  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    code: {
      cfd: getFixtureValue(data?.code, "cfd", "cfd"),
      rncp: getFixtureValue(data?.code, "rncp", "rncp"),
    },
    created_at: getFixtureValue(data, "created_at", new Date("2024-03-07T09:32:27.104Z")),
    updated_at: getFixtureValue(data, "updated_at", new Date("2024-03-07T09:32:27.104Z")),
  };
}
