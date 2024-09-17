import { notFound } from "@hapi/boom";
import { ObjectId } from "mongodb";
import { zRoutes } from "shared";
import type { IOrganisation } from "shared/models/organisation.model";

import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const organisationAdminRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/_private/admin/organisations",
    {
      schema: zRoutes.get["/_private/admin/organisations"],
      onRequest: [server.auth(zRoutes.get["/_private/admin/organisations"])],
    },
    async (_request, response) => {
      const organisations = await getDbCollection("organisations").find({}).toArray();

      return response.status(200).send(organisations);
    }
  );

  server.post(
    "/_private/admin/organisations",
    {
      schema: zRoutes.post["/_private/admin/organisations"],
      onRequest: [server.auth(zRoutes.post["/_private/admin/organisations"])],
    },
    async (request, response) => {
      const now = new Date();
      const organisation: IOrganisation = {
        _id: new ObjectId(),
        nom: request.body.nom,
        slug: request.body.nom.toLowerCase().replace(/ /g, "-"),
        habilitations: [],
        updated_at: now,
        created_at: now,
      };

      await getDbCollection("organisations").insertOne(organisation);

      return response.status(200).send(organisation);
    }
  );

  server.put(
    "/_private/admin/organisations/:id",
    {
      schema: zRoutes.put["/_private/admin/organisations/:id"],
      onRequest: [server.auth(zRoutes.put["/_private/admin/organisations/:id"])],
    },
    async (request, response) => {
      const now = new Date();

      const organisation = await getDbCollection("organisations").findOneAndUpdate(
        { _id: request.params.id },
        {
          $set: {
            ...request.body,
            updated_at: now,
          },
        },
        { returnDocument: "after" }
      );

      if (organisation === null) {
        throw notFound();
      }

      return response.status(200).send(organisation);
    }
  );
};
