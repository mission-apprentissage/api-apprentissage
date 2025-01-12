import { zOrganisation } from "api-alternance-sdk";
import { z } from "zod";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectId } from "./common.js";

const collectionName = "organisations" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ nom: 1 }, { unique: true }],
  [{ slug: 1 }, { unique: true }],
];

export const zOrganisationInternal = zOrganisation.extend({
  _id: zObjectId,
  updated_at: z.date().describe("Date de mise à jour en base de données"),
  created_at: z.date().describe("Date d'ajout en base de données"),
});

export const zOrganisationCreate = zOrganisation.pick({
  nom: true,
});

export const zOrganisationEdit = zOrganisation.pick({
  habilitations: true,
});

export type IOrganisationInternal = z.output<typeof zOrganisationInternal>;
export type IOrganisationCreate = z.output<typeof zOrganisationCreate>;

export const organisationModelDescriptor = {
  zod: zOrganisationInternal,
  indexes,
  collectionName,
};
