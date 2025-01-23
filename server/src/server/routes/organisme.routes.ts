import { zRoutes } from "shared";

import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { searchOrganisme, searchOrganismeMetadata } from "@/services/organisme/organisme.service.js";
import { paginate } from "@/services/pagination/pagination.service.js";

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
    async (request, response) => {
      const result = await paginate(getDbCollection("organisme"), request.query, {});

      return response.status(200).send(result);
    }
  );
};
