import type { IApiRouteSchema, ISecuredRouteSchema, WithSecurityScheme } from "api-alternance-sdk";
import { fastify } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { ObjectId } from "mongodb";
import { generateUserFixture } from "shared/models/fixtures/index";
import type { IUser } from "shared/models/user.model";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { apiKeyUsageMiddleware } from "./apiKeyUsageMiddleware.js";
import { auth } from "./authMiddleware.js";
import { errorMiddleware } from "./errorMiddleware.js";
import { generateApiKey } from "@/actions/users.actions.js";
import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { useMongo } from "@tests/mongo.test.utils.js";

useMongo();

describe("apiKeyUsageMiddleware", () => {
  const getSchema = {
    method: "get",
    path: "/",
    response: { 200: z.any() },
    securityScheme: {
      auth: "api-key",
      access: null,
      ressources: {},
    },
  } as const satisfies ISecuredRouteSchema;
  const getSchemaPublic = {
    method: "get",
    path: "/public",
    response: { 200: z.any() },
    securityScheme: null,
  } as const satisfies IApiRouteSchema;
  const postSchema = {
    method: "post",
    path: "/:name",
    params: z.object({ name: z.string() }),
    body: z.object({ code: z.number() }),
    response: { 200: z.any() },
    securityScheme: {
      auth: "api-key",
      access: null,
      ressources: {},
    },
  } as const satisfies ISecuredRouteSchema;

  const app: Server = fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("auth", <S extends IApiRouteSchema & WithSecurityScheme>(scheme: S) => auth(scheme));

  app.post("/:name", { schema: postSchema, onRequest: [app.auth(postSchema)] }, async (request, response) => {
    return response.status(request.body.code).send({ ok: true });
  });
  app.get("/public", { schema: getSchemaPublic }, async (_request, response) => {
    return response.status(200).send({ ok: true });
  });
  app.get("/", { schema: getSchema, onRequest: [app.auth(getSchema)] }, async (_request, response) => {
    return response.status(200).send({ ok: true });
  });
  app.setNotFoundHandler((_request, response) => {
    response.status(404).send({ ok: false });
  });

  apiKeyUsageMiddleware(app);
  errorMiddleware(app);

  beforeAll(async () => {
    await app.ready();
    return () => app.close();
  });

  let token: string;
  let token2: string;
  let user: IUser;

  beforeEach(async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2024-03-21T00:00:00Z"));

    user = generateUserFixture({
      email: "user@exemple.fr",
      is_admin: false,
    });
    await getDbCollection("users").insertOne(user);
    token = (await generateApiKey("", user)).value;
    token2 = (await generateApiKey("", user)).value;
    user = (await getDbCollection("users").findOne({ _id: user._id }))!;

    return () => {
      vi.useRealTimers();
    };
  });

  const runGet = (t: string = token) =>
    app.inject({
      method: "GET",
      url: "/",
      headers: {
        Authorization: `Bearer ${t}`,
      },
    });
  const runGetPublic = () =>
    app.inject({
      method: "GET",
      url: "/public",
    });

  const runPost = (name: string, code: number) =>
    app.inject({
      method: "POST",
      url: `/${name}`,
      body: { code },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  it("should register usage for authenticated user with api key", async () => {
    const response = await runGet();
    expect.soft(response.statusCode).toBe(200);
    expect.soft(response.json()).toEqual({ ok: true });

    const attributes = {
      _id: expect.any(ObjectId),
      user_id: user._id,
      api_key_id: user.api_keys[0]._id,
      method: "GET",
      path: "/",
    };

    // We advance time by 23 hours
    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        { ...attributes, date: new Date("2024-03-21T00:00:00Z"), code: 200, type: "success", count: 1 },
      ]);
      const u = await getDbCollection("users").findOne({ _id: user._id });
      expect(u?.api_keys).toEqual([
        {
          ...user.api_keys[0],
          last_used_at: new Date("2024-03-21T00:00:00Z"),
        },
        {
          ...user.api_keys[1],
          last_used_at: null,
        },
      ]);
    });

    await runGet();
    // We advance time by 23 hours
    vi.setSystemTime(new Date("2024-03-21T23:00:00Z"));
    await runGet();

    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        { ...attributes, date: new Date("2024-03-21T00:00:00Z"), code: 200, type: "success", count: 3 },
      ]);
      const u = await getDbCollection("users").findOne({ _id: user._id });
      expect(u?.api_keys).toEqual([
        {
          ...user.api_keys[0],
          last_used_at: new Date("2024-03-21T23:00:00Z"),
        },
        {
          ...user.api_keys[1],
          last_used_at: null,
        },
      ]);
    });

    // We advance time by 1 hour
    vi.setSystemTime(new Date("2024-03-22T00:00:00Z"));
    await runGet(token2);

    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        { ...attributes, date: new Date("2024-03-21T00:00:00Z"), code: 200, type: "success", count: 3 },
        {
          ...attributes,
          api_key_id: user.api_keys[1]._id,
          date: new Date("2024-03-22T00:00:00Z"),
          code: 200,
          type: "success",
          count: 1,
        },
      ]);
      const u = await getDbCollection("users").findOne({ _id: user._id });
      expect(u?.api_keys).toEqual([
        {
          ...user.api_keys[0],
          last_used_at: new Date("2024-03-21T23:00:00Z"),
        },
        {
          ...user.api_keys[1],
          last_used_at: new Date("2024-03-22T00:00:00Z"),
        },
      ]);
    });
  });

  it("should register the config path not real one", async () => {
    await runPost("value1", 200);
    await runPost("value2", 200);
    await runPost("value3", 400);

    const attributes = {
      _id: expect.any(ObjectId),
      user_id: user._id,
      api_key_id: user.api_keys[0]._id,
      method: "POST",
      path: "/:name",
    };

    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        { ...attributes, date: new Date("2024-03-21T00:00:00Z"), code: 200, type: "success", count: 2 },
        { ...attributes, date: new Date("2024-03-21T00:00:00Z"), code: 400, type: "client_error", count: 1 },
      ]);
    });
  });

  it("should not register usage for unauthenticated routes", async () => {
    await runGetPublic();
    expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([]);
  });

  it("should support concurrency", async () => {
    const tasks = [];
    for (let i = 0; i < 50; i++) {
      tasks.push(runGet());
    }
    await Promise.all(tasks);
    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        {
          _id: expect.any(ObjectId),
          user_id: user._id,
          api_key_id: user.api_keys[0]._id,
          method: "GET",
          path: "/",
          date: new Date("2024-03-21T00:00:00Z"),
          code: 200,
          type: "success",
          count: 50,
        },
      ]);
    });
  });
});
