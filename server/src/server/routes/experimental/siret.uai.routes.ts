import { zRoutes } from "shared";

import { runExperiementalRedressementUaiSiret } from "@/jobs/experimental/redressement/uai.siret";
import type { Server } from "@/server/server";

export const siretUaiRoutes = ({ server }: { server: Server }) => {
  server.post(
    "/experimental/siret_uai",
    {
      schema: zRoutes.post["/experimental/siret_uai"],
      onRequest: [server.auth(zRoutes.post["/experimental/siret_uai"])],
    },
    async (request, response) => {
      const { couple, certification, date } = request.body;

      const result = await runExperiementalRedressementUaiSiret({
        couple,
        certification,
        date,
      });
      return response.status(200).header("Content-Type", "application/json").send(result);
    }
  );
};
