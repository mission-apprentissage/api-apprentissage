import { zRoutes } from "shared";

import type { Server } from "@/server/server";
import { getDbCollection } from "@/services/mongodb/mongodbService";
import { createResponseStream } from "@/utils/streamUtils";

export const certificationsRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/organismes/v1/recherche",
    {
      schema: zRoutes.get["/organismes/v1/recherche"],
      onRequest: [server.auth(zRoutes.get["/organismes/v1/recherche"])],
    },
    async (request, response) => {
      const cursor = getDbCollection("certifications").find(request.query);

      return response
        .status(200)
        .header("Content-Type", "application/json")
        .send(createResponseStream(cursor, zRoutes.get["/certification/v1"].response["200"]));
    }
  );
};
