import { z } from "zod";

import { zObjectId } from "../../../models/common";
import { zUserCreate, zUserPublic } from "../../../models/user.model";
import { IRoutesDef, ZReqParamsSearchPagination } from "../../common.routes";

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
  post: {
    "/_private/admin/user": {
      method: "post",
      path: "/_private/admin/user",
      body: zUserCreate,
      response: {
        "200": zUserPublic,
      },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
