import { zRoutes } from "shared";

import { generateApiKey } from "../../../actions/users.actions";
import { getUserFromRequest } from "../../../services/security/authenticationService";
import { Server } from "../../server";

export const userRoutes = ({ server }: { server: Server }) => {
  /**
   * Génerer une clé API
   */
  server.get(
    "/_private/user/generate-api-key",
    {
      schema: zRoutes.get["/_private/user/generate-api-key"],
      onRequest: [server.auth(zRoutes.get["/_private/user/generate-api-key"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.get["/_private/user/generate-api-key"]);
      const api_key = await generateApiKey(user);
      return response.status(200).send({ api_key });
    }
  );
};
