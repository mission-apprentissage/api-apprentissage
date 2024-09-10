import { zRoutes } from "shared";

import type { Server } from "@/server/server.js";
import { searchJobOpportunitiesLba } from "@/services/apis/lba/lba.api.js";
import { convertJobSearchResponseLbaToApi } from "@/services/jobs/job.service.js";
import { getUserFromRequest } from "@/services/security/authenticationService.js";

export const jobRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/job/v1/search",
    {
      schema: zRoutes.get["/job/v1/search"],
      onRequest: [server.auth(zRoutes.get["/job/v1/search"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.get["/job/v1/search"]);
      const lbaResponse = await searchJobOpportunitiesLba(request.query, user);

      return response.status(200).send(convertJobSearchResponseLbaToApi(lbaResponse));
    }
  );
};
