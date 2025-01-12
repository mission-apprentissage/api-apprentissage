import { z } from "zod";

export const zOrganisation = z.object({
  nom: z
    .string()
    .min(2)
    .max(100)
    .describe("Nom de l'organisation")
    .transform((v) => v.trim()),
  slug: z
    .string()
    .min(2)
    .max(100)
    .describe("Slug de l'organisation")
    .transform((v) => v.trim().toLowerCase()),
  habilitations: z.enum(["jobs:write", "appointments:write", "applications:write"]).array(),
});

export type IOrganisation = z.output<typeof zOrganisation>;
