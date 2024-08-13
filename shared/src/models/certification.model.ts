import { zCertification } from "api-alternance-sdk";
import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from "./common.js";

const collectionName = "certifications" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ "identifiant.cfd": 1, "identifiant.rncp": 1 }, {}],
  [{ "identifiant.rncp": 1, "identifiant.cfd": 1 }, {}],
];

export const zCertificationInternal = zCertification.extend({
  _id: zObjectId,
  created_at: z.date(),
  updated_at: z.date(),
});

export type ICertificationInternal = z.output<typeof zCertificationInternal>;

export const certificationsModelDescriptor = {
  zod: zCertificationInternal,
  indexes,
  collectionName,
};
