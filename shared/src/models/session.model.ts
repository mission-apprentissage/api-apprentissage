import type { Jsonify } from "type-fest";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectIdMini } from "./common.js";

const collectionName = "sessions" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ expires_at: 1 }, { expireAfterSeconds: 0 }]];

export const ZSession = z.object({
  _id: zObjectIdMini,
  email: z.string(),
  updated_at: z.date(),
  created_at: z.date(),
  expires_at: z.date(),
});

export type ISession = z.output<typeof ZSession>;
export type ISessionJson = Jsonify<z.input<typeof ZSession>>;

export default {
  zod: ZSession,
  indexes,
  collectionName,
};
