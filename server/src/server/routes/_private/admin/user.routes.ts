import { notFound } from "@hapi/boom";
import { zRoutes } from "shared";

import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const userAdminRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/_private/admin/users",
    {
      schema: zRoutes.get["/_private/admin/users"],
      onRequest: [server.auth(zRoutes.get["/_private/admin/users"])],
    },
    async (request, response) => {
      const { q } = request.query;

      const filter = q ? { email: { $regex: q, $options: "i" } } : {};

      const users = await getDbCollection("users").find(filter).toArray();

      return response.status(200).send(users);
    }
  );

  server.get(
    "/_private/admin/users/:id",
    {
      schema: zRoutes.get["/_private/admin/users/:id"],
      onRequest: [server.auth(zRoutes.get["/_private/admin/users/:id"])],
    },
    async (request, response) => {
      const user = await getDbCollection("users").findOne({ _id: request.params.id });

      if (!user) {
        throw notFound();
      }

      return response.status(200).send(user);
    }
  );

  server.put(
    "/_private/admin/users/:id",
    {
      schema: zRoutes.put["/_private/admin/users/:id"],
      onRequest: [server.auth(zRoutes.put["/_private/admin/users/:id"])],
    },
    async (request, response) => {
      const user = await getDbCollection("users").findOneAndUpdate(
        { _id: request.params.id },
        { $set: request.body },
        { returnDocument: "after" }
      );

      if (!user) {
        throw notFound();
      }

      return response.status(200).send(user);
    }
  );

  server.delete(
    "/_private/admin/users/:id",
    {
      schema: zRoutes.delete["/_private/admin/users/:id"],
      onRequest: [server.auth(zRoutes.delete["/_private/admin/users/:id"])],
    },
    async (request, response) => {
      const user = await getDbCollection("users").findOneAndDelete({ _id: request.params.id });

      if (!user) {
        throw notFound();
      }

      return response.status(200).send({ success: true });
    }
  );
};
