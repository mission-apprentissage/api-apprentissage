import type { IApiRoutesDef } from "api-alternance-sdk";
import { z } from "zod";
import { zObjectId } from "zod-mongodb-schema";

import { zOrganisationCreate, zOrganisationEdit, zOrganisationInternal } from "../../../models/organisation.model.js";

export const zOrganisationAdminRoutes = {
  get: {
    "/_private/admin/organisations": {
      method: "get",
      path: "/_private/admin/organisations",
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
      params: z.object({ id: zObjectId }),
      body: zOrganisationEdit,
      response: { "200": zOrganisationInternal },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef;
