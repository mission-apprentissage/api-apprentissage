import { zRoutes } from "shared";

import { importers } from "@/jobs/importer/importers.js";
import type { Server } from "@/server/server.js";

export const importerAdminRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/_private/importers/status",
    {
      schema: zRoutes.get["/_private/importers/status"],
      onRequest: [server.auth(zRoutes.get["/_private/importers/status"])],
    },
    async (_request, response) => {
      const statuses = await Promise.all(
        Object.entries(importers).map(async ([name, importer]) => {
          const status = await importer.getStatus();
          return [name, status];
        })
      );

      return response.status(200).send(Object.fromEntries(statuses));
    }
  );
};
