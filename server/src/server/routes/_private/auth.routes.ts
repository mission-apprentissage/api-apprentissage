import Boom from "@hapi/boom";
import { zRoutes } from "shared";
import { IUser, toPublicUser } from "shared/models/user.model";

import { resetPassword, sendResetPasswordEmail, verifyEmailPassword } from "@/actions/auth.actions";
import { startSession, stopSession } from "@/actions/sessions.actions";
import { getUserFromRequest } from "@/services/security/authenticationService";

import { Server } from "../../server";

export const authRoutes = ({ server }: { server: Server }) => {
  /**
   * Récupérer l'utilisateur connecté
   */
  server.get(
    "/_private/auth/session",
    {
      schema: zRoutes.get["/_private/auth/session"],
      onRequest: [server.auth(zRoutes.get["/_private/auth/session"])],
    },
    async (request, response) => {
      const user = getUserFromRequest(request, zRoutes.get["/_private/auth/session"]);
      return response.status(200).send(toPublicUser(user));
    }
  );

  /**
   * Login
   */
  server.post(
    "/_private/auth/login",
    {
      schema: zRoutes.post["/_private/auth/login"],
    },
    async (request, response) => {
      const { email, password } = request.body;

      const user: IUser | undefined = await verifyEmailPassword(email, password);

      if (!user || !user._id) {
        throw Boom.forbidden("Identifiants incorrects");
      }

      await startSession(user.email, response);

      return response.status(200).send(toPublicUser(user));
    }
  );

  server.get(
    "/_private/auth/logout",
    {
      schema: zRoutes.get["/_private/auth/logout"],
    },
    async (request, response) => {
      await stopSession(request, response);

      return response.status(200).send({});
    }
  );

  server.get(
    "/_private/auth/reset-password",
    {
      schema: zRoutes.get["/_private/auth/reset-password"],
    },
    async (request, response) => {
      await sendResetPasswordEmail(request.query.email);
      return response.status(200).send({});
    }
  );

  server.post(
    "/_private/auth/reset-password",
    {
      schema: zRoutes.post["/_private/auth/reset-password"],
      onRequest: [server.auth(zRoutes.post["/_private/auth/reset-password"])],
    },
    async (request, response) => {
      const { password } = request.body;
      const user = getUserFromRequest(request, zRoutes.post["/_private/auth/reset-password"]);

      try {
        await resetPassword(user, password);

        return response.status(200).send({});
      } catch (error) {
        throw Boom.badData("Jeton invalide");
      }
    }
  );
};
