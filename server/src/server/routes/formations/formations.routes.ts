import { zRoutes } from "shared";

import type { Server } from "@/server/server.js";
import { searchFormation } from "@/services/formation/formation.service.js";

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
};
