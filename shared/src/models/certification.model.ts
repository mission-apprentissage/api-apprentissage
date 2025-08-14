import { zCertification } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectIdMini } from "./common.js";

const collectionName = "certifications" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ "identifiant.cfd": 1, "identifiant.rncp": 1 }, {}],
  [{ "identifiant.rncp": 1, "identifiant.cfd": 1 }, {}],
];

export const zCertificationInternal = z.extend(zCertification, {
  _id: zObjectIdMini,
  created_at: z.date(),
  updated_at: z.date(),
});

export type ICertificationInternal = z.output<typeof zCertificationInternal>;

export const certificationsModelDescriptor = {
  zod: zCertificationInternal,
  indexes,
  collectionName,
};
