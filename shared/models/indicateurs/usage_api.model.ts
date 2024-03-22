import { z } from "zod";

import { IModelDescriptor, zObjectId } from "../common";

const collectionName = "indicateurs.usage_api" as const;

const indexes: IModelDescriptor["indexes"] = [[{ method: 1, path: 1, date: 1, user_id: 1, api_key_id: 1 }, {}]];

export const zIndicateurUsageApi = z.object({
  _id: zObjectId,
  user_id: zObjectId,
  api_key_id: zObjectId,
  method: z.string(),
  path: z.string(),
  date: z.date(),
  status_code: z.number(),
  count: z.number(),
});

export type IIndicateurUsageApi = z.output<typeof zIndicateurUsageApi>;

export const indicateurUsageApiModelDescriptor = {
  zod: zIndicateurUsageApi,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;
