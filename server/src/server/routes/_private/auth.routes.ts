import { internal } from "@hapi/boom";
import { zRoutes } from "shared";
import { toPublicUser } from "shared/models/user.model";

import { registerUser, sendRegisterFeedbackEmail, sendRequestLoginEmail } from "@/actions/auth.actions";
import { startSession, stopSession } from "@/actions/sessions.actions";
import { Server } from "@/server/server";
import { getDbCollection } from "@/services/mongodb/mongodbService";
import { getUserFromRequest } from "@/services/security/authenticationService";

export const authRoutes = ({ server }: { server: Server }) => {
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

  server.post(
    "/_private/auth/login-request",
    {
      schema: zRoutes.post["/_private/auth/login-request"],
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "10 minute",
        },
      },
    },
    async (request, response) => {
      const { email } = request.body;
      await sendRequestLoginEmail(email);

      return response.status(200).send({ success: true });
    }
  );

  server.post(
    "/_private/auth/login",
    {
      schema: zRoutes.post["/_private/auth/login"],
      onRequest: [server.auth(zRoutes.post["/_private/auth/login"])],
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "10 minute",
        },
      },
    },
    async (request, response) => {
      const {
        identity: { email },
      } = getUserFromRequest(request, zRoutes.post["/_private/auth/login"]);

      const user = await getDbCollection("users").findOne({ email });

      if (!user) {
        throw internal("User not found");
      }

      await startSession(user.email, response);

      return response.status(200).send(toPublicUser(user));
    }
  );

  server.post(
    "/_private/auth/register",
    {
      schema: zRoutes.post["/_private/auth/register"],
      onRequest: [server.auth(zRoutes.post["/_private/auth/register"])],
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "10 minute",
        },
      },
    },
    async (request, response) => {
      const { identity } = getUserFromRequest(request, zRoutes.post["/_private/auth/register"]);

      const user = await registerUser(identity.email, request.body);

      await startSession(user.email, response);

      return response.status(200).send(toPublicUser(user));
    }
  );

  server.post(
    "/_private/auth/register-feedback",
    {
      schema: zRoutes.post["/_private/auth/register-feedback"],
      onRequest: [server.auth(zRoutes.post["/_private/auth/register-feedback"])],
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "10 minute",
        },
      },
    },
    async (request, response) => {
      const { identity } = getUserFromRequest(request, zRoutes.post["/_private/auth/register-feedback"]);

      await sendRegisterFeedbackEmail(identity.email, request.body);

      return response.status(200).send({ success: true });
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
};
