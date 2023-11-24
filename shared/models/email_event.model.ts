import { Jsonify } from "type-fest";
import { z } from "zod";

import { IModelDescriptor, zObjectId } from "./common";
import { zTemplate } from "./email_event/email_templates";

const collectionName = "email_events" as const;

const indexes: IModelDescriptor["indexes"] = [[{ type: 1, messageId: 1 }, {}]];

const zEmailError = z
  .object({
    type: z.enum(["fatal", "soft_bounce", "hard_bounce", "complaint", "invalid_email", "blocked", "error"]).optional(),
    message: z.string().optional(),
  })
  .strict();

export type IEmailError = z.output<typeof zEmailError>;

export const ZEmailEvent = z
  .object({
    _id: zObjectId,
    email: z.string().describe("Addresse email"),
    template: zTemplate,
    created_at: z.date(),
    updated_at: z.date(),
    opened_at: z.date().nullable(),
    delivered_at: z.date().nullable(),
    messageId: z.string().nullable(),
    errors: z.array(zEmailError),
  })
  .strict();

export type IEmailEvent = z.output<typeof ZEmailEvent>;
export type IEventJsonJson = Jsonify<z.output<typeof ZEmailEvent>>;

export default {
  zod: ZEmailEvent,
  indexes,
  collectionName,
};
