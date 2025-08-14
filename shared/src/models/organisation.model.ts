import { zOrganisation } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectIdMini } from "./common.js";

const collectionName = "organisations" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ nom: 1 }, { unique: true }],
  [{ slug: 1 }, { unique: true }],
];

export const zOrganisationInternal = z.extend(zOrganisation, {
  _id: zObjectIdMini,
  updated_at: z.date(),
  created_at: z.date(),
});

export const zOrganisationCreate = z.pick(zOrganisation, {
  nom: true,
});

export const zOrganisationEdit = z.pick(zOrganisation, {
  habilitations: true,
});

export type IOrganisationInternal = z.output<typeof zOrganisationInternal>;
export type IOrganisationCreate = z.output<typeof zOrganisationCreate>;

export const organisationModelDescriptor = {
  zod: zOrganisationInternal,
  indexes,
  collectionName,
};
