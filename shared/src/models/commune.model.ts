import { z } from "zod/v4-mini";
import { zCommune } from "api-alternance-sdk";
import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectIdMini } from "./common.js";

const collectionName = "commune" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ "code.insee": 1 }, { unique: true }],
  [{ "code.postaux": 1 }, {}],
  [{ "arrondissements.code": 1 }, {}],
  [{ "departement.codeInsee": 1 }, {}],
  [{ "anciennes.codeInsee": 1 }, {}],
  [{ "mission_locale.id": 1 }, {}],
  [{ "mission_locale.localisation.geopoint": "2dsphere", "mission_locale.id": 1 }, {}],
];

export const zCommuneInternal = z.extend(zCommune, {
  _id: zObjectIdMini,
  created_at: z.date(),
  updated_at: z.date(),
});

export type ICommuneInternal = z.output<typeof zCommuneInternal>;

export const communeModelDescriptor = {
  zod: zCommuneInternal,
  indexes,
  collectionName,
};
