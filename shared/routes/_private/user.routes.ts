import { z } from "zod";

import { zObjectId } from "../../models/common";
import { zApiKeyPrivate } from "../../models/user.model";
import { IRoutesDef } from "../common.routes";

export const zUserRoutes = {
  get: {
    "/_private/user/api-keys": {
      method: "get",
      path: "/_private/user/api-keys",
      response: {
        "200": z.array(zApiKeyPrivate),
      },
      securityScheme: {
        auth: "cookie-session",
        access: null,
        ressources: {},
      },
    },
  },
  post: {
    "/_private/user/api-key": {
      method: "post",
      path: "/_private/user/api-key",
      body: z.object({ name: z.string().trim() }).strict(),
      response: {
        "200": zApiKeyPrivate,
      },
      securityScheme: {
        auth: "cookie-session",
        access: null,
        ressources: {},
      },
    },
  },
  delete: {
    "/_private/user/api-key/:id": {
      method: "delete",
      path: "/_private/user/api-key/:id",
      params: z.object({ id: zObjectId }),
      response: {
        "200": z.object({ success: z.literal(true) }).strict(),
      },
      securityScheme: {
        auth: "cookie-session",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;
