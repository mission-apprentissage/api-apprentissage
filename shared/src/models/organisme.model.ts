import { zOrganisme } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectId } from "./common.js";

const collectionName = "organisme" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ "identifiant.siret": 1, "identifiant.uai": 1 }, { unique: true }],
];

export const zOrganismeInternal = z.extend(zOrganisme, {
  _id: zObjectId,
  created_at: z.date(),
  updated_at: z.date(),
});

export type IOrganismeInternal = z.output<typeof zOrganismeInternal>;

export const organismeModelDescriptor = {
  zod: zOrganismeInternal,
  indexes,
  collectionName,
};
