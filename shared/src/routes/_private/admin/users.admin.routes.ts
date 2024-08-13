import { z } from "zod";

import { zObjectId } from "../../../models/common.js";
import { zUserPublic } from "../../../models/user.model.js";
import { IRoutesDef, ZReqParamsSearchPagination } from "../../common.routes.js";

export const zUserAdminRoutes = {
  get: {
    "/_private/admin/users": {
      method: "get",
      path: "/_private/admin/users",
      querystring: ZReqParamsSearchPagination,
      response: { "200": z.array(zUserPublic) },
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
      response: { "200": zUserPublic },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
  post: {},
} as const satisfies IRoutesDef;
