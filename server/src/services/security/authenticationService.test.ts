import { useMongo } from "@tests/mongo.test.utils.js";
import { ObjectId } from "mongodb";
import { generateOrganisationFixture, generateUserFixture } from "shared/models/fixtures/index";
import type { ISecuredRouteSchema } from "shared/routes/common.routes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createSession, createSessionToken } from "@/actions/sessions.actions.js";
import { generateApiKey } from "@/actions/users.actions.js";
import config from "@/config.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { authenticationMiddleware } from "./authenticationService.js";

useMongo();

describe("authenticationMiddleware", () => {
  const user = generateUserFixture({
    email: "user@email.com",
    is_admin: false,
  });
  const userWithOrg = generateUserFixture({
    email: "userOrg@email.com",
    is_admin: false,
    organisation: "Hello Work",
  });
  let otherUser = generateUserFixture({
    email: "other@email.com",
    is_admin: false,
  });
  const organisation = generateOrganisationFixture({
    nom: "Hello Work",
    slug: "hello work",
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
      const token = createSessionToken("user@email.com");
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
      const token = createSessionToken(userWithOrg.email);
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
      const token = createSessionToken("user@email.com");
      await createSession("user@email.com");
      await vi.advanceTimersByTimeAsync(config.session.cookie.maxAge + 1);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { cookies: { [config.session.cookieName]: token } };

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez être connecté pour accéder à cette ressource"
      );
    });

    it("should throw unauthorized if session is not found", async () => {
      const token = createSessionToken("user@email.com");
      await createSession("other-user-session@email.com");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { cookies: { [config.session.cookieName]: token } };

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez être connecté pour accéder à cette ressource"
      );
    });

    it("should throw unauthorized if user is not found", async () => {
      const token = createSessionToken("user-not-found@email.com");
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
    const expiresAt = new Date("2024-09-17T00:00:00Z");

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
            _id: expect.any(ObjectId),
            key: expect.any(String),
            expires_at: expiresAt,
            last_used_at: tomorrow,
            name: expect.any(String),
            created_at: now,
          },
        ],
        updated_at: tomorrow,
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
      const expiresAt2 = new Date("2024-09-18T12:00:00Z");

      const in2Days = new Date("2024-03-23T23:00:00Z");
      vi.setSystemTime(in2Days);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req1: any = { headers: { authorization: `Bearer ${token1.value}` } };

      const expectedUser1 = {
        ...user,
        api_keys: [
          {
            _id: expect.any(ObjectId),
            key: expect.any(String),
            expires_at: expiresAt,
            last_used_at: in2Days,
            name: expect.any(String),
            created_at: now,
          },
          {
            _id: expect.any(ObjectId),
            key: expect.any(String),
            expires_at: expiresAt2,
            last_used_at: null,
            name: expect.any(String),
            created_at: tomorrow,
          },
        ],
        updated_at: in2Days,
      };

      await expect(authenticationMiddleware(schema, req1)).resolves.toBeUndefined();
      expect(req1.user).toEqual({
        type: "user",
        value: expectedUser1,
      });
      expect(req1.api_key).toEqual(expectedUser1.api_keys[0]);
      const allUsers1 = await getDbCollection("users").find().toArray();
      expect(allUsers1).toEqual([
        expectedUser1,
        // Should not be modified
        otherUser,
        userWithOrg,
      ]);

      const in3Days = new Date("2024-03-24T23:00:00Z");
      vi.setSystemTime(in3Days);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req2: any = { headers: { authorization: `Bearer ${token2.value}` } };

      const expectedUser2 = {
        ...user,
        api_keys: [
          {
            _id: expect.any(ObjectId),
            key: expect.any(String),
            expires_at: expiresAt,
            last_used_at: in2Days,
            name: expect.any(String),
            created_at: now,
          },
          {
            _id: expect.any(ObjectId),
            key: expect.any(String),
            expires_at: expiresAt2,
            last_used_at: in3Days,
            name: expect.any(String),
            created_at: tomorrow,
          },
        ],
        updated_at: in3Days,
      };

      await expect(authenticationMiddleware(schema, req2)).resolves.toBeUndefined();
      expect(req2.user).toEqual({
        type: "user",
        value: expectedUser2,
      });
      expect(req2.api_key).toEqual(expectedUser2.api_keys[1]);
      const allUsers2 = await getDbCollection("users").find().toArray();
      expect(allUsers2).toEqual([
        expectedUser2,
        // Should not be modified
        otherUser,
        userWithOrg,
      ]);
    });

    it("should throw unauthorized if key is expired", async () => {
      const token = await generateApiKey("", user);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = { headers: { authorization: `Bearer ${token.value}` } };

      vi.advanceTimersByTime(config.api_key.expiresIn + 1);

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez fournir une clé d'API valide pour accéder à cette ressource"
      );
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

      await expect(authenticationMiddleware(schema, req)).rejects.toThrow(
        "Vous devez fournir une clé d'API valide pour accéder à cette ressource"
      );
    });
  });
});
