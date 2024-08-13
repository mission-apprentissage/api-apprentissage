import { zRoutes } from "shared";

import type { Server } from "@/server/server.js";
import { searchOrganisme, searchOrganismeMetadata } from "@/services/organisme/organisme.service.js";

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
};
