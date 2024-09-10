import { zRoutes } from "shared";

import { deleteApiKey, generateApiKey } from "@/actions/users.actions.js";
import type { Server } from "@/server/server.js";
import { getUserFromRequest } from "@/services/security/authenticationService.js";

export const userRoutes = ({ server }: { server: Server }) => {
  server.post(
    "/_private/user/api-key",
    {
      schema: zRoutes.post["/_private/user/api-key"],
      onRequest: [server.auth(zRoutes.post["/_private/user/api-key"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.post["/_private/user/api-key"]);
      const result = await generateApiKey(request.body.name, user);
      return response.status(200).send(result);
    }
  );

  server.get(
    "/_private/user/api-keys",
    {
      schema: zRoutes.get["/_private/user/api-keys"],
      onRequest: [server.auth(zRoutes.get["/_private/user/api-keys"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.get["/_private/user/api-keys"]);
      return response.status(200).send(user.api_keys.map((k) => ({ ...k, value: null })));
    }
  );

  server.delete(
    "/_private/user/api-key/:id",
    {
      schema: zRoutes.delete["/_private/user/api-key/:id"],
      onRequest: [server.auth(zRoutes.delete["/_private/user/api-key/:id"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.delete["/_private/user/api-key/:id"]);
      const { id } = request.params;
      await deleteApiKey(id, user);
      return response.status(200).send({ success: true });
    }
  );
};
