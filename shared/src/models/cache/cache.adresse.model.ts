import { zGeoJsonPoint } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../common.js";
import { zObjectIdMini } from "../common.js";

const collectionName = "cache.adresse" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ "identifiant.codePostal": 1, "identifiant.codeInsee": 1, "identifiant.adresse": 1 }, { unique: true }],
  [{ ttl: 1 }, { expireAfterSeconds: 0 }],
];

export const zAdresseQuery = z.object({
  codePostal: z.nullable(z.string()),
  codeInsee: z.string(),
  adresse: z.string(),
});

export const zCacheApiAdresse = z.object({
  _id: zObjectIdMini,
  identifiant: zAdresseQuery,
  ttl: z.nullable(z.date()),
  data: z.nullable(zGeoJsonPoint),
});

export type IAdresseQuery = z.output<typeof zAdresseQuery>;

export default {
  zod: zCacheApiAdresse,
  indexes,
  collectionName,
};
