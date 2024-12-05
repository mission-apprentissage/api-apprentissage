import { zRoutes } from "shared";

import config from "@/config.js";
import type { Server } from "@/server/server.js";
import { forwardApiRequest } from "@/services/forward/forwardApi.service.js";
import { getUserFromRequest } from "@/services/security/authenticationService.js";

export const jobRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/job/v1/search",
    {
      schema: zRoutes.get["/job/v1/search"],
      onRequest: [server.auth(zRoutes.get["/job/v1/search"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.get["/job/v1/search"]);
      const querystring = new URL(request.url, config.apiPublicUrl).search;

      return forwardApiRequest(
        {
          endpoint: config.api.lba.endpoint,
          path: "/v3/jobs/search",
          querystring,
          requestInit: { method: "GET" },
        },
        response,
        { user, organisation: request.organisation ?? null }
      );
    }
  );

  server.post(
    "/job/v1/offer",
    {
      schema: zRoutes.post["/job/v1/offer"],
      onRequest: [server.auth(zRoutes.post["/job/v1/offer"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.post["/job/v1/offer"]);

      return forwardApiRequest(
        {
          endpoint: config.api.lba.endpoint,
          path: "/v3/jobs",
          requestInit: {
            method: "POST",
            body: JSON.stringify(request.body),
            headers: { "Content-Type": "application/json" },
          },
        },
        response,
        { user, organisation: request.organisation ?? null }
      );
    }
  );

  server.post(
    "/job/v1/apply",
    {
      schema: zRoutes.post["/job/v1/apply"],
      onRequest: [server.auth(zRoutes.post["/job/v1/apply"])],
      bodyLimit: 5 * 1024 ** 2, // 5MB
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.post["/job/v1/apply"]);

      return forwardApiRequest(
        {
          endpoint: config.api.lba.endpoint,
          path: "/v2/application",
          requestInit: {
            method: "POST",
            body: JSON.stringify(request.body),
            headers: { "Content-Type": "application/json" },
          },
        },
        response,
        { user, organisation: request.organisation ?? null }
      );
    }
  );

  server.put(
    "/job/v1/offer/:id",
    {
      schema: zRoutes.put["/job/v1/offer/:id"],
      onRequest: [server.auth(zRoutes.put["/job/v1/offer/:id"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.put["/job/v1/offer/:id"]);

      return forwardApiRequest(
        {
          endpoint: config.api.lba.endpoint,
          path: `/v3/jobs/${encodeURIComponent(request.params.id)}`,
          requestInit: {
            method: "PUT",
            body: JSON.stringify(request.body),
            headers: { "Content-Type": "application/json" },
          },
        },
        response,
        { user, organisation: request.organisation ?? null }
      );
    }
  );
};
