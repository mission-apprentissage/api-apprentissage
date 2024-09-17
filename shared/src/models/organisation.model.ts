import { z } from "zod";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectId } from "./common.js";

const collectionName = "organisations" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ nom: 1 }, { unique: true }],
  [{ slug: 1 }, { unique: true }],
];

export const zOrganisation = z.object({
  _id: zObjectId,
  nom: z
    .string()
    .min(2)
    .max(100)
    .describe("Nom de l'organisation")
    .transform((v) => v.trim()),
  slug: z
    .string()
    .min(2)
    .max(100)
    .describe("Slug de l'organisation")
    .transform((v) => v.trim().toLowerCase()),
  habilitations: z.enum(["jobs:write"]).array(),
  updated_at: z.date().describe("Date de mise à jour en base de données"),
  created_at: z.date().describe("Date d'ajout en base de données"),
});

export const zOrganisationCreate = zOrganisation.pick({
  nom: true,
});

export const zOrganisationEdit = zOrganisation.pick({
  habilitations: true,
});

export type IOrganisation = z.output<typeof zOrganisation>;
export type IOrganisationCreate = z.output<typeof zOrganisationCreate>;

export const organisationModelDescriptor = {
  zod: zOrganisation,
  indexes,
  collectionName,
};
