import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectIdMini } from "./common.js";

const collectionName = "email_denied" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ email: 1 }, {}]];

export const ZEmailDenied = z.object({
  _id: zObjectIdMini,
  email: z.string(),
  reason: z.enum(["unsubscribe"]),
  updated_at: z.optional(z.date()),
  created_at: z.date(),
});

export type IEmailDenied = z.output<typeof ZEmailDenied>;

export default {
  zod: ZEmailDenied,
  indexes,
  collectionName,
};
