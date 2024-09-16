import { ObjectId } from "bson";

import type { IOrganisation } from "../organisation.model.js";

type IOrganisationFixtureInput = Partial<IOrganisation>;

export function generateOrganisationFixture(data?: IOrganisationFixtureInput): IOrganisation {
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
