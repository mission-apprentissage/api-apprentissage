import type { Jsonify } from "type-fest";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectIdMini } from "./common.js";
import { zTemplate } from "./email_event/email_templates.js";

const collectionName = "email_events" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ type: 1, messageId: 1 }, {}]];

const zEmailError = z.object({
  type: z.optional(z.enum(["fatal", "soft_bounce", "hard_bounce", "complaint", "invalid_email", "blocked", "error"])),
  message: z.optional(z.string()),
});
export type IEmailError = z.output<typeof zEmailError>;

export const ZEmailEvent = z.object({
  _id: zObjectIdMini,
  email: z.string(),
  template: zTemplate,
  created_at: z.date(),
  updated_at: z.date(),
  opened_at: z.nullable(z.date()),
  delivered_at: z.nullable(z.date()),
  messageId: z.nullable(z.string()),
  errors: z.array(zEmailError),
});

export type IEmailEvent = z.output<typeof ZEmailEvent>;
export type IEventJsonJson = Jsonify<z.output<typeof ZEmailEvent>>;

export default {
  zod: ZEmailEvent,
  indexes,
  collectionName,
};
