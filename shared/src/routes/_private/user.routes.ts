import type { IApiRoutesDef } from "api-alternance-sdk"
import { z } from "zod/v4-mini"

import { zObjectIdMini } from "../../models/common.js"
import { zApiKeyEnv, zApiKeyPrivate } from "../../models/user.model.js"

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
      // Pas de type par défaut : une clé sandbox interroge la recette de La bonne alternance y compris
      // en lecture, le choix doit être explicite
      body: z.object({ name: z.string().check(z.trim()), env: zApiKeyEnv }),
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
      params: z.object({ id: zObjectIdMini }),
      response: {
        "200": z.object({ success: z.literal(true) }),
      },
      securityScheme: {
        auth: "cookie-session",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IApiRoutesDef
