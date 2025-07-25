import type { ISecuredRouteSchema } from "api-alternance-sdk";
import { generateOrganisationFixture, generateUserFixture } from "shared/models/fixtures/index";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod/v4-mini";
import { authenticationMiddleware } from "./authenticationService.js";
import { useMongo } from "@tests/mongo.test.utils.js";

import { createSession, createSessionToken } from "@/actions/sessions.actions.js";
import { generateApiKey } from "@/actions/users.actions.js";
import config from "@/config.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

useMongo();

describe("authenticationMiddleware", () => {
  const user = generateUserFixture({
    email: "user@email.com",
    is_admin: false,
  });
  const userWithOrg = generateUserFixture({
    email: "userOrg@email.com",
    is_admin: false,
    organisation: "HelloWork",
  });
  let otherUser = generateUserFixture({
    email: "other@email.com",
    is_admin: false,
  });
  const organisation = generateOrganisationFixture({
    nom: "HelloWork",
    slug: "hellowork",
  });

  beforeEach(async () => {
    await getDbCollection("users").insertMany([user, otherUser, userWithOrg]);
    await getDbCollection("organisations").insertOne(organisation);
  });

  describe("cookie-session", () => {
    const schema: ISecuredRouteSchema = {
      method: "get",
      path: "/",
      response: { 200: z.any() },
      securityScheme: {
        auth: "cookie-session",
        access: null,
        ressources: {},
      },
    };

    const now = new Date("2024-03-21T00:00:00Z");

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(now);

      return () => {
        vi.useRealTimers();
      };
    });

    it("should set req.user if cookie is valid", async () => {
      const token = await createSessionToken("user@email.com");
      await createSession("user@email.com");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { cookies: { [config.session.cookieName]: token } };

      await expect(authenticationMiddleware(schema, req)).resolves.toBeUndefined();
      expect(req.user).toEqual({
        type: "user",
        value: user,
      });
      expect(req.organisation).toBeNull();
    });

    it("should set req.organisation if cookie is valid", async () => {
      const token = await createSessionToken(userWithOrg.email);
      await createSession(userWithOrg.email);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { cookies: { [config.session.cookieName]: token } };

      await expect(authenticationMiddleware(schema, req)).resolves.toBeUndefined();
      expect(req.user).toEqual({
        type: "user",
        value: userWithOrg,
      });
      expect(req.organisation).toEqual(organisation);
    });

    it("should throw unauthorized if cookie is not provided", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { cookies: {} };

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez être connecté pour accéder à cette ressource"
      );
    });

    it("should throw unauthorized if cookie is invalid", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { cookies: { [config.session.cookieName]: "invalid" } };

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez être connecté pour accéder à cette ressource"
      );
    });

    it("should throw unauthorized if cookie is expired", async () => {
      const token = await createSessionToken("user@email.com");
      await createSession("user@email.com");
      await vi.advanceTimersByTimeAsync(config.session.cookie.maxAge + 1);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { cookies: { [config.session.cookieName]: token } };

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez être connecté pour accéder à cette ressource"
      );
    });

    it("should throw unauthorized if session is not found", async () => {
      const token = await createSessionToken("user@email.com");
      await createSession("other-user-session@email.com");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { cookies: { [config.session.cookieName]: token } };

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez être connecté pour accéder à cette ressource"
      );
    });

    it("should throw unauthorized if user is not found", async () => {
      const token = await createSessionToken("user-not-found@email.com");
      await createSession("user-not-found@email.com");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { cookies: { [config.session.cookieName]: token } };

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez être connecté pour accéder à cette ressource"
      );
    });
  });

  describe("api-key", () => {
    const schema: ISecuredRouteSchema = {
      method: "get",
      path: "/",
      response: { 200: z.any() },
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    };

    const now = new Date("2024-03-21T00:00:00Z");
    const expiresAt = new Date("2025-03-21T00:00:00Z");

    beforeEach(async () => {
      await generateApiKey("", otherUser);
      otherUser = (await getDbCollection("users").findOne({ email: otherUser.email }))!;
    });

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(now);

      return () => {
        vi.useRealTimers();
      };
    });

    it("should set req.user if api key is valid", async () => {
      const token = await generateApiKey("", user);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { headers: { authorization: `Bearer ${token.value}` } };

      const tomorrow = new Date("2024-03-22T12:00:00Z");
      vi.setSystemTime(tomorrow);

      const expectedUser = {
        ...user,
        api_keys: [
          {
            _id: token._id,
            key: token.key,
            expires_at: token.expires_at,
            last_used_at: null,
            name: token.name,
            created_at: now,
            expiration_warning_sent: null,
          },
        ],
      };
      await expect(authenticationMiddleware(schema, req)).resolves.toBeUndefined();
      expect(req.user).toEqual({
        type: "user",
        value: expectedUser,
      });
      expect(req.api_key).toEqual(expectedUser.api_keys[0]);

      const allUsers = await getDbCollection("users").find().toArray();
      expect(allUsers).toEqual([
        expectedUser,
        // Should not be modified
        otherUser,
        userWithOrg,
      ]);
    });

    it("should support multiple keys", async () => {
      const token1 = await generateApiKey("", user);

      const tomorrow = new Date("2024-03-22T12:00:00Z");
      vi.setSystemTime(tomorrow);

      const token2 = await generateApiKey("", user);
      const expiresAt2 = new Date("2025-03-22T12:00:00Z");

      const in2Days = new Date("2024-03-23T23:00:00Z");
      vi.setSystemTime(in2Days);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req1: any = { headers: { authorization: `Bearer ${token1.value}` } };

      const expectedUser = {
        ...user,
        api_keys: [
          {
            _id: token1._id,
            key: token1.key,
            expires_at: expiresAt,
            last_used_at: null,
            name: token1.name,
            created_at: now,
            expiration_warning_sent: null,
          },
          {
            _id: token2._id,
            key: token2.key,
            expires_at: expiresAt2,
            last_used_at: null,
            name: token2.name,
            created_at: tomorrow,
            expiration_warning_sent: null,
          },
        ],
        // Last time we updated token
        updated_at: tomorrow,
      };

      await expect(authenticationMiddleware(schema, req1)).resolves.toBeUndefined();
      expect(req1.user).toEqual({
        type: "user",
        value: expectedUser,
      });
      expect(req1.api_key).toEqual(expectedUser.api_keys[0]);
      const allUsers1 = await getDbCollection("users").find().toArray();
      expect(allUsers1).toEqual([expectedUser, otherUser, userWithOrg]);

      const in3Days = new Date("2024-03-24T23:00:00Z");
      vi.setSystemTime(in3Days);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req2: any = { headers: { authorization: `Bearer ${token2.value}` } };

      await expect(authenticationMiddleware(schema, req2)).resolves.toBeUndefined();
      expect(req2.user).toEqual({
        type: "user",
        value: expectedUser,
      });
      expect(req2.api_key).toEqual(expectedUser.api_keys[1]);
      const allUsers2 = await getDbCollection("users").find().toArray();
      expect(allUsers2).toEqual([expectedUser, otherUser, userWithOrg]);
    });

    it("should throw unauthorized if key is expired", async () => {
      const token = await generateApiKey("", user);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { headers: { authorization: `Bearer ${token.value}` } };

      vi.advanceTimersByTime(config.api_key.expiresIn + 1);

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow("La clé d'API a expirée");
    });

    it("should throw unauthorized if key is removed", async () => {
      const token = await generateApiKey("", user);

      await getDbCollection("users").updateOne({ email: user.email }, { $set: { api_keys: [] } });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { headers: { authorization: `Bearer ${token.value}` } };

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez fournir une clé d'API valide pour accéder à cette ressource"
      );
    });

    it("should throw unauthorized if key is invalid", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { headers: { authorization: `Bearer invalid` } };

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow("Impossible de déchiffrer la clé d'API");
    });
  });
});
