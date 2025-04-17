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
const zTemplateApiKeyExpiration30days = z.object({
  name: z.literal("api-key-expiration-30-days"),
  to: z.string().email(),
  from: z.string().email(),
});
const zTemplateApiKeyExpiration15days = z.object({
  name: z.literal("api-key-expiration-15-days"),
  to: z.string().email(),
  from: z.string().email(),
});

type ITemplateRegister = z.output<typeof zTemplateRegister>;
type ITemplateMagicLink = z.output<typeof zTemplateMagicLink>;
type ITemplateRegisterFeedback = z.output<typeof zTemplateRegisterFeedback>;
type ITemplateApiKeyExpiration30days = z.output<typeof zTemplateApiKeyExpiration30days>;
type ITemplateApiKeyExpiration15days = z.output<typeof zTemplateApiKeyExpiration15days>;

export const zTemplate = z.discriminatedUnion("name", [
  zTemplateRegister,
  zTemplateMagicLink,
  zTemplateRegisterFeedback,
  zTemplateApiKeyExpiration30days,
  zTemplateApiKeyExpiration15days,
]);

export type ITemplate = z.output<typeof zTemplate>;

export type TemplatePayloads = {
  register: ITemplateRegister;
  "magic-link": ITemplateMagicLink;
  "register-feedback": ITemplateRegisterFeedback;
  "api-key-expiration-30-days": ITemplateApiKeyExpiration30days;
  "api-key-expiration-15-days": ITemplateApiKeyExpiration15days;
};

export type TemplateName = keyof TemplatePayloads;
