import { ObjectId } from "bson";

import type { ISourceKitApprentissage } from "../source/kitApprentissage/source.kit_apprentissage.model.js";

export function generateKitApprentissageFixture(data?: Partial<ISourceKitApprentissage>): ISourceKitApprentissage {
  return {
    _id: new ObjectId(),
    cfd: "code",
    rncp: "fiche",
    ...data,
  };
}
