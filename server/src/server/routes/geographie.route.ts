import { zRoutes } from "shared";

import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const geographieRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/geographie/v1/commune/search",
    {
      schema: zRoutes.get["/geographie/v1/commune/search"],
      onRequest: [server.auth(zRoutes.get["/geographie/v1/commune/search"])],
    },
    async (request, response) => {
      const { code } = request.query;
      const communes = await getDbCollection("commune")
        .find({ $or: [{ "code.insee": code }, { "code.postaux": code }] })
        .toArray();

      return response.send(communes);
    }
  );
};
