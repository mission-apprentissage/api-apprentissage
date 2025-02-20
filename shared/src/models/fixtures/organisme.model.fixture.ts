import type { IOrganismeInput } from "api-alternance-sdk/fixtures";
import { generateOrganismeFixture } from "api-alternance-sdk/fixtures";
import { ObjectId } from "bson";

import type { IOrganismeInternal } from "../organisme.model.js";

export function generateOrganismeInternalFixture(data?: IOrganismeInput<IOrganismeInternal>): IOrganismeInternal {
  return {
    _id: new ObjectId(),
    created_at: new Date("2024-04-19T00:00:00Z"),
    updated_at: new Date("2024-04-19T00:00:00Z"),
    ...data,
    ...generateOrganismeFixture(data),
  };
}
