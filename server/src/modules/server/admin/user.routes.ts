import Boom from "@hapi/boom";
import { RootFilterOperators } from "mongodb";
import { zRoutes } from "shared";
import { IUser, toPublicUser } from "shared/models/user.model";

import { getDbCollection } from "../../../common/utils/mongodbUtils";
import { createUser } from "../../actions/users.actions";
import { Server } from "../server";

export const userAdminRoutes = ({ server }: { server: Server }) => {
  server.post(
    "/admin/user",
    {
      schema: zRoutes.post["/admin/user"],
      onRequest: [server.auth(zRoutes.post["/admin/user"])],
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
    "/admin/users",
    {
      schema: zRoutes.get["/admin/users"],
      onRequest: [server.auth(zRoutes.get["/admin/users"])],
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
    "/admin/users/:id",
    {
      schema: zRoutes.get["/admin/users/:id"],
      onRequest: [server.auth(zRoutes.get["/admin/users/:id"])],
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
