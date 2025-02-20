import type { IFormationFixtureInput } from "api-alternance-sdk/fixtures";
import { generateFormationFixture } from "api-alternance-sdk/fixtures";
import { ObjectId } from "bson";

import type { IFormationInternal } from "../formation.model.js";

export function generateFormationInternalFixture(
  data?: IFormationFixtureInput<IFormationInternal>
): IFormationInternal {
  return {
    _id: new ObjectId(),
    created_at: new Date("2024-12-28T00:00:00.000Z"),
    updated_at: new Date("2025-01-07T00:00:00.000Z"),
    ...data,
    ...generateFormationFixture(data),
  };
}
