import { zRoutes } from "shared";

import type { Server } from "@/server/server.js";
import { createJobOfferLba, searchJobOpportunitiesLba, updateJobOfferLba } from "@/services/apis/lba/lba.api.js";
import { convertJobOfferWritableApiToLba, convertJobSearchResponseLbaToApi } from "@/services/jobs/job.service.js";
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
      const lbaResponse = await searchJobOpportunitiesLba(request.query, user, request.organisation ?? null);

      return response.status(200).send(convertJobSearchResponseLbaToApi(lbaResponse));
    }
  );

  server.post(
    "/job/v1/offer",
    {
      schema: zRoutes.post["/job/v1/offer"],
      onRequest: [server.auth(zRoutes.post["/job/v1/offer"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.post["/job/v1/offer"]);
      const result = await createJobOfferLba(
        convertJobOfferWritableApiToLba(request.body),
        user,
        request.organisation ?? null
      );

      return response.status(200).send(result);
    }
  );

  server.put(
    "/job/v1/offer/:id",
    {
      schema: zRoutes.put["/job/v1/offer/:id"],
      onRequest: [server.auth(zRoutes.put["/job/v1/offer/:id"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.put["/job/v1/offer/:id"]);
      await updateJobOfferLba(
        request.params.id,
        convertJobOfferWritableApiToLba(request.body),
        user,
        request.organisation ?? null
      );

      return response.status(204).send();
    }
  );
};
