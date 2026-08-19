import type { IApiRoutesDef } from "api-alternance-sdk"
import { zOrganisationHabilitation } from "api-alternance-sdk"
import { z } from "zod/v4-mini"
import { zObjectIdMini } from "zod-mongodb-schema"

import { zOrganisationCreate, zOrganisationEdit, zOrganisationInternal } from "../../../models/organisation.model.js"

// Les habilitations sont transmises en paramètres répétés (`?habilitations=a&habilitations=b`),
// une valeur unique est donc reçue sous forme de chaîne et normalisée en tableau.
const zHabilitationsFilter = z.pipe(
  z.union([zOrganisationHabilitation, z.array(zOrganisationHabilitation)]),
  z.transform((value) => (Array.isArray(value) ? value : [value]))
)

export const zOrganisationAdminFilters = z.object({
  q: z.optional(z.string()),
  habilitations: z.optional(zHabilitationsFilter),
})

export type IOrganisationAdminFilters = z.output<typeof zOrganisationAdminFilters>

export const zOrganisationAdminRoutes = {
  get: {
    "/_private/admin/organisations": {
      method: "get",
      path: "/_private/admin/organisations",
      querystring: zOrganisationAdminFilters,
      response: { "200": z.array(zOrganisationInternal) },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
  post: {
    "/_private/admin/organisations": {
      method: "post",
      path: "/_private/admin/organisations",
      body: zOrganisationCreate,
      response: { "200": zOrganisationInternal },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
  put: {
    "/_private/admin/organisations/:id": {
      method: "put",
      path: "/_private/admin/organisations/:id",
      params: z.object({ id: zObjectIdMini }),
      body: zOrganisationEdit,
      response: { "200": zOrganisationInternal },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
  delete: {
    "/_private/admin/organisations/:id": {
      method: "delete",
      path: "/_private/admin/organisations/:id",
      params: z.object({ id: zObjectIdMini }),
      response: {
        "200": z.object({ success: z.literal(true) }),
      },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef
