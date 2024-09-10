import { z } from "zod";

import { zObjectId } from "../../../models/common.js";
import { zUserAdminUpdate, zUserAdminView } from "../../../models/user.model.js";
import type { IRoutesDef } from "../../common.routes.js";
import { ZReqParamsSearchPagination } from "../../common.routes.js";

export const zUserAdminRoutes = {
  get: {
    "/_private/admin/users": {
      method: "get",
      path: "/_private/admin/users",
      querystring: ZReqParamsSearchPagination,
      response: { "200": z.array(zUserAdminView) },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
    "/_private/admin/users/:id": {
      method: "get",
      path: "/_private/admin/users/:id",
      params: z.object({ id: zObjectId }).strict(),
      response: { "200": zUserAdminView },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
  post: {},
  put: {
    "/_private/admin/users/:id": {
      method: "put",
      path: "/_private/admin/users/:id",
      params: z.object({ id: zObjectId }).strict(),
      body: zUserAdminUpdate,
      response: { "200": zUserAdminView },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
