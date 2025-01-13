import { ObjectId } from "bson";

import type { IOrganisationInternal } from "../organisation.model.js";

type IOrganisationFixtureInput = Partial<IOrganisationInternal>;

export function generateOrganisationFixture(data?: IOrganisationFixtureInput): IOrganisationInternal {
  return {
    _id: new ObjectId(),
    nom: "Ma Super Organisation",
    slug: "ma super organisation",
    habilitations: [],
    created_at: new Date("2024-03-21T00:00:00Z"),
    updated_at: new Date("2024-03-21T00:00:00Z"),
    ...data,
  };
}
