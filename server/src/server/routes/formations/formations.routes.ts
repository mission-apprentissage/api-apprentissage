import { zRoutes } from "shared";

import config from "@/config.js";
import type { Server } from "@/server/server.js";
import { searchFormation } from "@/services/formation/formation.service.js";
import { forwardApiRequest } from "@/services/forward/forwardApi.service.js";
import { getUserFromRequest } from "@/services/security/authenticationService.js";

export const formationRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/formation/v1/search",
    {
      schema: zRoutes.get["/formation/v1/search"],
      onRequest: [server.auth(zRoutes.get["/formation/v1/search"])],
    },
    async (request, response) => {
      const result = await searchFormation(request.query);
      return response.status(200).send(result);
    }
  );

  server.get(
    "/formation/v1/:id",
    {
      schema: zRoutes.get["/formation/v1/:id"],
      onRequest: [server.auth(zRoutes.get["/formation/v1/:id"])],
    },
    async (request, response) => {
      const result = await getFormationByCleMe(request.params.id);
      return response.status(200).send(result);
    }
  );

  server.post(
    "/formation/v1/appointment/generate-link",
    {
      schema: zRoutes.post["/formation/v1/appointment/generate-link"],
      onRequest: [server.auth(zRoutes.post["/formation/v1/appointment/generate-link"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.post["/formation/v1/appointment/generate-link"]);

      return forwardApiRequest(
        {
          endpoint: config.api.lba.endpoint,
          path: "/v2/appointment",
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
};
