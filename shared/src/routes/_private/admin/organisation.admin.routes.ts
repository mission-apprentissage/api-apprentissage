import { z } from "zod";
import { zObjectId } from "zod-mongodb-schema";

import { zOrganisation, zOrganisationCreate, zOrganisationEdit } from "../../../models/organisation.model.js";
import type { IRoutesDef } from "../../common.routes.js";

export const zOrganisationAdminRoutes = {
  get: {
    "/_private/admin/organisations": {
      method: "get",
      path: "/_private/admin/organisations",
      response: { "200": z.array(zOrganisation) },
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
      response: { "200": zOrganisation },
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
      response: { "200": zOrganisation },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
