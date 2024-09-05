import { z } from "zod";

import { zOrganisation, zOrganisationCreate } from "../../../models/organisation.model.js";
import { IRoutesDef } from "../../common.routes.js";

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
} as const satisfies IRoutesDef;
