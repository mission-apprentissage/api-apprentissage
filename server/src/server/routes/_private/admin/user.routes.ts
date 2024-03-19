import Boom from "@hapi/boom";
import { RootFilterOperators } from "mongodb";
import { zRoutes } from "shared";
import { IUser, toPublicUser } from "shared/models/user.model";

import { createUser } from "@/actions/users.actions";
import { getDbCollection } from "@/services/mongodb/mongodbService";

import { Server } from "../../../server";

export const userAdminRoutes = ({ server }: { server: Server }) => {
  server.post(
    "/_private/admin/user",
    {
      schema: zRoutes.post["/_private/admin/user"],
      onRequest: [server.auth(zRoutes.post["/_private/admin/user"])],
    },
    async (request, response) => {
      const user = await createUser(request.body);

      if (!user) {
        throw Boom.badImplementation("Impossible de créer l'utilisateur");
      }

      return response.status(200).send(toPublicUser(user));
    }
  );

  server.get(
    "/_private/admin/users",
    {
      schema: zRoutes.get["/_private/admin/users"],
      onRequest: [server.auth(zRoutes.get["/_private/admin/users"])],
    },
    async (request, response) => {
      const filter: RootFilterOperators<IUser> = {};

      const { q } = request.query;

      if (q) {
        filter.$text = { $search: q };
      }

      const users = await getDbCollection("users").find(filter).toArray();

      return response.status(200).send(users.map(toPublicUser));
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
        throw Boom.notFound();
      }

      return response.status(200).send(toPublicUser(user));
    }
  );
};
