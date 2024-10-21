import { z } from "zod";

import type { IModelDescriptorGeneric } from "../common.js";
import { zObjectId } from "../common.js";

const collectionName = "indicateurs.usage_api" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ method: 1, path: 1, queryParams: 1, date: 1, user_id: 1, api_key_id: 1 }, { unique: true }],
];

export const zIndicateurUsageApi = z.object({
  _id: zObjectId,
  method: z.string(),
  path: z.string(),
  queryParams: z.record(z.string(), z.string()),
  date: z.date(),
  user_id: zObjectId,
  api_key_id: zObjectId,
  usage: z.record(z.number()),
});

export type IIndicateurUsageApi = z.output<typeof zIndicateurUsageApi>;

export const indicateurUsageApiModelDescriptor = {
  zod: zIndicateurUsageApi,
  indexes,
  collectionName,
};
