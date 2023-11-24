import { z } from "zod";

import { zObjectId } from "../../models/common";
import { zUserCreate, zUserPublic } from "../../models/user.model";
import { IRoutesDef, ZReqParamsSearchPagination } from "../common.routes";

export const zUserAdminRoutes = {
  get: {
    "/admin/users": {
      method: "get",
      path: "/admin/users",
      querystring: ZReqParamsSearchPagination,
      response: { "200": z.array(zUserPublic) },
      securityScheme: {
        auth: "cookie-session",
        access: "admin",
        ressources: {},
      },
    },
    "/admin/users/:id": {
      method: "get",
      path: "/admin/users/:id",
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
    "/admin/user": {
      method: "post",
      path: "/admin/user",
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
