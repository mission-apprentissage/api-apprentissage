import { z } from "zod/v4-mini"

export const ORGANISATION_HABILITATIONS = ["jobs:write", "appointments:write", "applications:write"] as const

export const zOrganisationHabilitation = z.enum(ORGANISATION_HABILITATIONS)

export const zOrganisation = z.object({
  nom: z.pipe(
    z.pipe(
      z.string().check(z.maxLength(100)),
      z.transform((v) => v.trim())
    ),
    z.string().check(z.minLength(2), z.maxLength(100))
  ),
  slug: z.pipe(
    z.pipe(
      z.string().check(z.maxLength(100)),
      z.transform((v) => v.trim().toLowerCase())
    ),
    z.string().check(z.minLength(2), z.maxLength(100))
  ),
  habilitations: z.array(zOrganisationHabilitation),
})

export type IOrganisationHabilitation = (typeof ORGANISATION_HABILITATIONS)[number]
export type IOrganisation = z.output<typeof zOrganisation>
