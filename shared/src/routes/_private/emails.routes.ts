import { z } from "zod";

import { zObjectId } from '../../models/common.js';
import { IRoutesDef } from '../common.routes.js';

export const zEmailRoutes = {
  get: {
    "/_private/emails/preview": {
      method: "get",
      path: "/_private/emails/preview",
      querystring: z
        .object({
          data: z.string(),
        })
        .strict(),
      response: {
        "200": z.unknown(),
      },
      securityScheme: null,
    },
    "/_private/emails/:id/markAsOpened": {
      method: "get",
      path: "/_private/emails/:id/markAsOpened",
      params: z.object({ id: zObjectId }).strict(),
      response: {
        "200": z.unknown(),
      },
      securityScheme: {
        auth: "access-token",
        access: null,
        ressources: {},
      },
    },
    "/_private/emails/unsubscribe": {
      method: "get",
      path: "/_private/emails/unsubscribe",
      querystring: z
        .object({
          data: z.string(),
        })
        .strict(),
      response: {
        "200": z.unknown(),
      },
      securityScheme: null,
    },
  },
  post: {
    "/_private/emails/webhook": {
      method: "post",
      path: "/_private/emails/webhook",
      querystring: z
        .object({
          webhookKey: z.string(),
        })
        .passthrough(),
      body: z
        .object({
          event: z.string(), //https://developers.sendinblue.com/docs/transactional-webhooks
          "message-id": z.string(),
        })
        .strict(),
      response: {
        "200": z.unknown(),
      },
      securityScheme: null,
    },
  },
} as const satisfies IRoutesDef;
