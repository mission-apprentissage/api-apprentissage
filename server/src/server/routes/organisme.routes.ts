import { zRoutes } from "shared";

import type { Server } from "@/server/server";
import { searchOrganisme, searchOrganismeMetadata } from "@/services/organisme/organisme.service";

export const organismeRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/organismes/v1/recherche",
    {
      schema: zRoutes.get["/organismes/v1/recherche"],
      onRequest: [server.auth(zRoutes.get["/organismes/v1/recherche"])],
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
