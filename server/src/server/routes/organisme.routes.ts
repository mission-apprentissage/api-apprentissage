import { zRoutes } from "shared";

import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { searchOrganisme, searchOrganismeMetadata } from "@/services/organisme/organisme.service.js";
import { createResponseStream } from "@/utils/streamUtils.js";

export const organismeRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/organisme/v1/recherche",
    {
      schema: zRoutes.get["/organisme/v1/recherche"],
      onRequest: [server.auth(zRoutes.get["/organisme/v1/recherche"])],
    },
    async (request, response) => {
      const [metadata, { candidats, resultat }] = await Promise.all([
        searchOrganismeMetadata(request.query),
        searchOrganisme(request.query),
      ]);

      return response.status(200).send({ metadata, resultat, candidats });
    }
  );

  server.get(
    "/organisme/v1/export",
    {
      schema: zRoutes.get["/organisme/v1/export"],
      onRequest: [server.auth(zRoutes.get["/organisme/v1/export"])],
    },
    async (_request, response) => {
      const cursor = getDbCollection("organisme").find({});

      return response
        .status(200)
        .header("Content-Type", "application/json")
        .send(createResponseStream(cursor, zRoutes.get["/organisme/v1/export"].response["200"]));
    }
  );
};
