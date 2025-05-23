// Pour chaque template, déclarer les champs qui sont utilisés dans le template
// token: string; // obligatoire et commun à tous les emails, ajouté automatiquement dans l'emails.actions

import { z } from "zod";

// Ignore any extra props added by jwt parsing (iat, iss, ...)
const zTemplateRegister = z.object({
  name: z.literal("register"),
  to: z.string().email(),
  token: z.string(),
});
const zTemplateMagicLink = z.object({
  name: z.literal("magic-link"),
  to: z.string().email(),
  token: z.string(),
});
const zTemplateRegisterFeedback = z.object({
  name: z.literal("register-feedback"),
  to: z.string().email(),
  from: z.string().email(),
  comment: z.string(),
});
const zTemplateApiKeyWillExpire = z.object({
  name: z.literal("api-key-will-expire"),
  to: z.string().email(),
  days_left: z.number(),
  expires_at: z.object({ fr: z.string(), en: z.string() }),
  key_name: z.string(),
});

type ITemplateRegister = z.output<typeof zTemplateRegister>;
type ITemplateMagicLink = z.output<typeof zTemplateMagicLink>;
type ITemplateRegisterFeedback = z.output<typeof zTemplateRegisterFeedback>;
type ITemplateApiKeyWillExpire = z.output<typeof zTemplateApiKeyWillExpire>;

export const zTemplate = z.discriminatedUnion("name", [
  zTemplateRegister,
  zTemplateMagicLink,
  zTemplateRegisterFeedback,
  zTemplateApiKeyWillExpire,
]);

export type ITemplate = z.output<typeof zTemplate>;

export type TemplatePayloads = {
  register: ITemplateRegister;
  "magic-link": ITemplateMagicLink;
  "register-feedback": ITemplateRegisterFeedback;
  "api-key-will-expire": ITemplateApiKeyWillExpire;
};

export type TemplateName = keyof TemplatePayloads;
