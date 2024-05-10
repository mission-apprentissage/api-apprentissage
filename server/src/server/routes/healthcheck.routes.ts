import { zRoutes } from "shared";

import config from "@/config";
import type { Server } from "@/server/server";
import { ensureInitialization } from "@/services/mongodb/mongodbService";

export const healthcheckRoutes = ({ server }: { server: Server }) => {
  server.get("/healthcheck", { schema: zRoutes.get["/healthcheck"] }, async (request, response) => {
    ensureInitialization();
    response.status(200).send({
      name: "API Apprentissage",
      version: config.version,
      env: config.env,
    });
  });
  server.get(
    "/healthcheck/sentry",
    {
      schema: zRoutes.get["/healthcheck/sentry"],
    },
    async () => {
      throw new Error("testing sentry error");
    }
  );
};
