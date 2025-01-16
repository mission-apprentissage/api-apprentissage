import { useMongo } from "@tests/mongo.test.utils.js";
import { ObjectId } from "mongodb";
import { generateOrganisationFixture, generateUserFixture } from "shared/models/fixtures/index";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { generateMagicLinkToken, generateRegisterToken } from "@/actions/auth.actions.js";
import { createSession, createSessionToken, getSession } from "@/actions/sessions.actions.js";
import config from "@/config.js";
import type { Server } from "@/server/server.js";
import createServer from "@/server/server.js";
import { sendEmail } from "@/services/mailer/mailer.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { parseAccessToken } from "@/services/security/accessTokenService.js";

type Cookie = {
  name: string;
  value: string;
  path: string;
  httpOnly: boolean;
};

vi.mock("@/services/mailer/mailer", () => {
  return {
    sendEmail: vi.fn(),
  };
});

describe("Authentication", () => {
  useMongo();
  let app: Server;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    return () => app.close();
  }, 15_000);

  describe("GET /api/_private/auth/session", () => {
    it("should get the current user connected via cookie-session", async () => {
      const user = generateUserFixture({
        email: "connected@exemple.fr",
        is_admin: false,
      });
      await getDbCollection("users").insertOne(user);

      const token = createSessionToken(user.email);
      await createSession(user.email);

      const userWithToken = await getDbCollection("users").findOne({ _id: user._id });

      expect(userWithToken?.api_keys).toHaveLength(0);

      const response = await app.inject({
        method: "GET",
        url: "/api/_private/auth/session",
        headers: {
          ["Cookie"]: `api_session=${token}`,
        },
      });

      const userResponse = response.json();

      expect(response.statusCode).toBe(200);
      expect(userResponse).toEqual({
        user: {
          _id: user._id.toString(),
          email: "connected@exemple.fr",
          organisation: null,
          is_admin: false,
          has_api_key: false,
          api_key_used_at: null,
          created_at: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
          updated_at: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
        },
        organisation: null,
      });
    });

    it("should get the current user connected via cookie-session", async () => {
      const organisation = generateOrganisationFixture({
        nom: "mia",
      });
      const user = generateUserFixture({
        email: "connected@exemple.fr",
        is_admin: false,
        organisation: organisation.nom,
      });
      await getDbCollection("organisations").insertOne(organisation);
      await getDbCollection("users").insertOne(user);

      const token = createSessionToken(user.email);
      await createSession(user.email);

      const userWithToken = await getDbCollection("users").findOne({ _id: user._id });

      expect(userWithToken?.api_keys).toHaveLength(0);

      const response = await app.inject({
        method: "GET",
        url: "/api/_private/auth/session",
        headers: {
          ["Cookie"]: `api_session=${token}`,
        },
      });

      const userResponse = response.json();

      expect(response.statusCode).toBe(200);
      expect(userResponse).toEqual({
        user: {
          _id: user._id.toString(),
          email: "connected@exemple.fr",
          organisation: organisation.nom,
          is_admin: false,
          has_api_key: false,
          api_key_used_at: null,
          created_at: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
          updated_at: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
        },
        organisation: {
          slug: organisation.slug,
          nom: organisation.nom,
          habilitations: organisation.habilitations,
        },
      });
    });

    it("should returns 401 when user is not connected", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/_private/auth/session",
      });

      const userResponse = response.json();

      expect(response.statusCode).toBe(401);
      expect(userResponse).toEqual({
        message: "Vous devez être connecté pour accéder à cette ressource",
        name: "Unauthorized",
        statusCode: 401,
      });
    });
  });

  describe("POST /_private/auth/login-request", () => {
    it("should send register email for new email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/auth/login-request",
        payload: {
          email: "user@exemple.fr",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ success: true });

      expect(vi.mocked(sendEmail)).toHaveBeenCalledWith({
        name: "register",
        to: "user@exemple.fr",
        token: expect.any(String),
      });

      const accessToken = parseAccessToken(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (vi.mocked(sendEmail).mock.calls[0][0] as any).token,
        { method: "post", path: "/_private/auth/register" },
        {},
        {}
      );
      expect(accessToken).toEqual({
        exp: expect.any(Number),
        iat: expect.any(Number),
        identity: {
          email: "user@exemple.fr",
          organisation: null,
        },
        iss: "http://localhost",
        scopes: [
          {
            method: "post",
            options: "all",
            path: "/_private/auth/register",
            resources: {},
          },
          {
            method: "post",
            options: "all",
            path: "/_private/auth/register-feedback",
            resources: {},
          },
        ],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((accessToken as any).exp).toBeLessThanOrEqual(Date.now() / 1_000 + 30 * 24 * 3600);
    });

    it("should send magic link email for existing email", async () => {
      const user = generateUserFixture({
        email: "user@exemple.fr",
      });
      await getDbCollection("users").insertOne(user);

      const response = await app.inject({
        method: "POST",
        url: "/api/_private/auth/login-request",
        payload: {
          email: "user@exemple.fr",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ success: true });

      expect(vi.mocked(sendEmail)).toHaveBeenCalledWith({
        name: "magic-link",
        to: "user@exemple.fr",
        token: expect.any(String),
      });

      const accessToken = parseAccessToken(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (vi.mocked(sendEmail).mock.calls[0][0] as any).token,
        { method: "post", path: "/_private/auth/login" },
        {},
        {}
      );
      expect(accessToken).toEqual({
        exp: expect.any(Number),
        iat: expect.any(Number),
        identity: {
          email: "user@exemple.fr",
          organisation: null,
        },
        iss: "http://localhost",
        scopes: [
          {
            method: "post",
            options: "all",
            path: "/_private/auth/login",
            resources: {},
          },
        ],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((accessToken as any).exp).toBeLessThanOrEqual(Date.now() / 1_000 + 7 * 24 * 3600);
    });
  });

  describe("POST /_private/auth/register-feedback", () => {
    it("should send feedback email", async () => {
      const token = generateRegisterToken("user@exemple.fr");
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/auth/register-feedback",
        headers: { authorization: `Bearer ${token}` },
        body: {
          comment: "My super comment",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ success: true });

      expect(vi.mocked(sendEmail)).toHaveBeenCalledWith({
        name: "register-feedback",
        to: "support_api@apprentissage.beta.gouv.fr",
        comment: "My super comment",
        from: "user@exemple.fr",
      });
    });
  });

  describe("POST /api/_private/auth/login", () => {
    it("should returns 401 if missing access-token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/auth/login",
      });

      const userResponse = response.json();

      expect(response.statusCode).toBe(401);
      expect(userResponse).toEqual({
        message: "Le lien de connexion pour accéder à cette ressource est invalide",
        name: "Unauthorized",
        statusCode: 401,
      });
    });

    it("should start session", async () => {
      const user = generateUserFixture({
        email: "user@exemple.fr",
      });
      await getDbCollection("users").insertOne(user);
      const token = generateMagicLinkToken("user@exemple.fr", null);
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/auth/login",
        headers: { authorization: `Bearer ${token}` },
      });

      const userResponse = response.json();

      expect(response.statusCode).toBe(200);
      const userData = {
        _id: user._id.toString(),
        api_key_used_at: null,
        created_at: user.created_at.toJSON(),
        organisation: null,
        email: user.email,
        has_api_key: false,
        is_admin: false,
        updated_at: user.updated_at.toJSON(),
      };
      expect(userResponse).toEqual({
        user: userData,
        organisation: null,
      });

      const cookies = response.cookies as Cookie[];
      const sessionCookie = cookies.find((cookie) => cookie.name === config.session.cookieName) as Cookie;

      const session = await getSession({ email: user.email });
      expect(session).toEqual({
        _id: expect.any(ObjectId),
        email: user.email,
        expires_at: expect.any(Date),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });

      const responseSession = await app.inject({
        method: "GET",
        url: "/api/_private/auth/session",
        cookies: {
          [sessionCookie.name]: sessionCookie.value,
        },
      });

      expect(responseSession.statusCode).toBe(200);
      expect(responseSession.json()).toEqual({
        user: userData,
        organisation: null,
      });
    });

    it("should start session with organisation", async () => {
      const organisation = generateOrganisationFixture({
        nom: "mia",
      });

      const user = generateUserFixture({
        email: "user@exemple.fr",
        organisation: organisation.nom,
      });
      await getDbCollection("users").insertOne(user);
      await getDbCollection("organisations").insertOne(organisation);
      const token = generateMagicLinkToken("user@exemple.fr", organisation.nom);
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/auth/login",
        headers: { authorization: `Bearer ${token}` },
      });

      const userResponse = response.json();

      expect(response.statusCode).toBe(200);
      const userData = {
        _id: user._id.toString(),
        api_key_used_at: null,
        created_at: user.created_at.toJSON(),
        organisation: organisation.nom,
        email: user.email,
        has_api_key: false,
        is_admin: false,
        updated_at: user.updated_at.toJSON(),
      };
      expect(userResponse).toEqual({
        user: userData,
        organisation: {
          nom: organisation.nom,
          slug: organisation.slug,
          habilitations: organisation.habilitations,
        },
      });

      const cookies = response.cookies as Cookie[];
      const sessionCookie = cookies.find((cookie) => cookie.name === config.session.cookieName) as Cookie;

      const session = await getSession({ email: user.email });
      expect(session).toEqual({
        _id: expect.any(ObjectId),
        email: user.email,
        expires_at: expect.any(Date),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });

      const responseSession = await app.inject({
        method: "GET",
        url: "/api/_private/auth/session",
        cookies: {
          [sessionCookie.name]: sessionCookie.value,
        },
      });

      expect(responseSession.statusCode).toBe(200);
      expect(responseSession.json()).toEqual({
        user: userData,
        organisation: {
          nom: organisation.nom,
          slug: organisation.slug,
          habilitations: organisation.habilitations,
        },
      });
    });
  });

  describe("POST /_private/auth/register", () => {
    it("should returns 401 if missing access-token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/auth/register",
      });

      const userResponse = response.json();

      expect(response.statusCode).toBe(401);
      expect(userResponse).toEqual({
        message: "Le lien de connexion pour accéder à cette ressource est invalide",
        name: "Unauthorized",
        statusCode: 401,
      });
    });

    it("should create user", async () => {
      const token = generateRegisterToken("user@exemple.fr");
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/auth/register",
        headers: { authorization: `Bearer ${token}` },
        body: {
          type: "entreprise",
          activite: "",
          objectif: "concevoir",
          cas_usage: "Mon cas",
          cgu: true,
        },
      });

      const userResponse = response.json();

      expect(response.statusCode).toBe(200);

      const user = await getDbCollection("users").findOne({ email: "user@exemple.fr" });

      if (!user) {
        expect(user).not.toBe(null);
        return;
      }

      const userData = {
        _id: user._id.toString(),
        api_key_used_at: null,
        created_at: user.created_at.toJSON(),
        email: user.email,
        organisation: null,
        has_api_key: false,
        is_admin: false,
        updated_at: user.updated_at.toJSON(),
      };
      expect(userResponse).toEqual({ user: userData, organisation: null });

      const cookies = response.cookies as Cookie[];
      const sessionCookie = cookies.find((cookie) => cookie.name === config.session.cookieName) as Cookie;

      const session = await getSession({ email: user.email });
      expect(session).toEqual({
        _id: expect.any(ObjectId),
        email: user.email,
        expires_at: expect.any(Date),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });

      const responseSession = await app.inject({
        method: "GET",
        url: "/api/_private/auth/session",
        cookies: {
          [sessionCookie.name]: sessionCookie.value,
        },
      });

      expect(responseSession.statusCode).toBe(200);
      expect(responseSession.json()).toEqual({ user: userData, organisation: null });
    });
  });

  describe("GET /_private/auth/logout", () => {
    it("should do nothing when logged-out already", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/_private/auth/logout",
      });

      expect(response.statusCode).toBe(200);
    });

    it("should logout when connected", async () => {
      const user = generateUserFixture({
        email: "user@exemple.fr",
      });
      await getDbCollection("users").insertOne(user);
      const token = generateMagicLinkToken("user@exemple.fr", null);
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/auth/login",
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);

      const cookies = response.cookies as Cookie[];
      const sessionCookie = cookies.find((cookie) => cookie.name === config.session.cookieName) as Cookie;

      expect(await getSession({ email: user.email })).not.toBe(null);

      const logOutResponse = await app.inject({
        method: "GET",
        url: "/api/_private/auth/logout",
        cookies: {
          [sessionCookie.name]: sessionCookie.value,
        },
      });

      expect(logOutResponse.statusCode).toBe(200);
      expect(logOutResponse.cookies).toEqual([
        {
          // Expired cookie
          expires: new Date(0),
          httpOnly: true,
          name: "api_session",
          path: "/",
          sameSite: "Lax",
          value: "",
        },
      ]);

      expect(await getSession({ email: user.email })).toBe(null);

      const responseSession = await app.inject({
        method: "GET",
        url: "/api/_private/auth/session",
        cookies: {
          [sessionCookie.name]: sessionCookie.value,
        },
      });

      expect(responseSession.statusCode).toBe(401);
    });
  });
});
