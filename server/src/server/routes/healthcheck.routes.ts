import { zRoutes } from "shared";

import config from "@/config.js";
import type { Server } from "@/server/server.js";
import { ensureInitialization } from "@/services/mongodb/mongodbService.js";

export const healthcheckRoutes = ({ server }: { server: Server }) => {
  server.get("/healthcheck", { schema: zRoutes.get["/healthcheck"] }, async (_request, response) => {
    ensureInitialization();
    response.status(200).send({
      name: "API Apprentissage",
      version: config.version,
      env: config.env,
    });
  });
};
