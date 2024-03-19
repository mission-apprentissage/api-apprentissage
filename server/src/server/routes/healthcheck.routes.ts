import { zRoutes } from "shared";

import config from "@/config";

import { ensureInitialization } from "../../services/mongodb/mongodbService";
import type { Server } from "../server";

export const healthcheckRoutes = ({ server }: { server: Server }) => {
  server.get("/healthcheck", { schema: zRoutes.get["/healthcheck"] }, async (request, response) => {
    ensureInitialization();
    response.status(200).send({
      name: `${config.productName} Apprentissage API`,
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
