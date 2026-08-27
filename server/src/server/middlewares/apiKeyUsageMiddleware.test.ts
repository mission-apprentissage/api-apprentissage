import { useMongo } from "@tests/mongo.test.utils.js"
import type { IApiRouteSchema, ISecuredRouteSchema, WithSecurityScheme } from "api-alternance-sdk"
import { fastify } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
import { ObjectId } from "mongodb"
import { generateUserFixture } from "shared/models/fixtures/index"
import type { IUser } from "shared/models/user.model"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod/v4-mini"
import { generateApiKey } from "@/actions/users.actions.js"
import type { Server } from "@/server/server.js"
import { getDbCollection } from "@/services/mongodb/mongodbService.js"
import { apiKeyUsageMiddleware } from "./apiKeyUsageMiddleware.js"
import { auth } from "./authMiddleware.js"
import { errorMiddleware } from "./errorMiddleware.js"

useMongo()

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
  } as const satisfies ISecuredRouteSchema
  const getSchemaPublic = {
    method: "get",
    path: "/public",
    response: { 200: z.any() },
    securityScheme: null,
  } as const satisfies IApiRouteSchema
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
  } as const satisfies ISecuredRouteSchema

  const app: Server = fastify().withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.decorate("auth", <S extends IApiRouteSchema & WithSecurityScheme>(scheme: S) => auth(scheme))

  app.post("/:name", { schema: postSchema, onRequest: [app.auth(postSchema)] }, async (request, response) => {
    return response.status(request.body.code as 200).send({ ok: true })
  })
  app.get("/public", { schema: getSchemaPublic }, async (_request, response) => {
    return response.status(200).send({ ok: true })
  })
  app.get("/", { schema: getSchema, onRequest: [app.auth(getSchema)] }, async (_request, response) => {
    return response.status(200).send({ ok: true })
  })
  app.setNotFoundHandler((_request, response) => {
    response.status(404).send({ ok: false })
  })

  apiKeyUsageMiddleware(app)
  errorMiddleware(app)

  beforeAll(async () => {
    await app.ready()
    return () => app.close()
  })

  let token: string
  let token2: string
  let user: IUser

  beforeEach(async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date("2024-03-21T00:00:00Z"))

    user = generateUserFixture({
      email: "user@exemple.fr",
      is_admin: false,
    })
    await getDbCollection("users").insertOne(user)
    token = (await generateApiKey("", "production", user)).value
    token2 = (await generateApiKey("", "production", user)).value
    user = (await getDbCollection("users").findOne({ _id: user._id }))!

    return () => {
      vi.useRealTimers()
    }
  })

  const runGet = (t: string = token) =>
    app.inject({
      method: "GET",
      url: "/",
      headers: {
        Authorization: `Bearer ${t}`,
      },
    })
  const runGetPublic = () =>
    app.inject({
      method: "GET",
      url: "/public",
    })

  const runPost = (name: string, code: number) =>
    app.inject({
      method: "POST",
      url: `/${name}`,
      body: { code },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

  it("should register usage for authenticated user with api key", async () => {
    const response = await runGet()
    expect.soft(response.statusCode).toBe(200)
    expect.soft(response.json()).toEqual({ ok: true })

    const attributes = {
      _id: expect.any(ObjectId),
      user_id: user._id,
      api_key_id: user.api_keys[0]._id,
      api_key_env: "production",
      method: "GET",
      path: "/",
    }

    // We advance time by 23 hours
    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        { ...attributes, date: new Date("2024-03-21T00:00:00Z"), code: 200, type: "success", count: 1 },
      ])
      const u = await getDbCollection("users").findOne({ _id: user._id })
      expect(u?.api_keys).toEqual([
        {
          ...user.api_keys[0],
          last_used_at: new Date("2024-03-21T00:00:00Z"),
        },
        {
          ...user.api_keys[1],
          last_used_at: null,
        },
      ])
    })

    await runGet()
    // We advance time by 23 hours
    vi.setSystemTime(new Date("2024-03-21T23:00:00Z"))
    await runGet()

    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        { ...attributes, date: new Date("2024-03-21T00:00:00Z"), code: 200, type: "success", count: 3 },
      ])
      const u = await getDbCollection("users").findOne({ _id: user._id })
      expect(u?.api_keys).toEqual([
        {
          ...user.api_keys[0],
          last_used_at: new Date("2024-03-21T23:00:00Z"),
        },
        {
          ...user.api_keys[1],
          last_used_at: null,
        },
      ])
    })

    // We advance time by 1 hour
    vi.setSystemTime(new Date("2024-03-22T00:00:00Z"))
    await runGet(token2)

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
      ])
      const u = await getDbCollection("users").findOne({ _id: user._id })
      expect(u?.api_keys).toEqual([
        {
          ...user.api_keys[0],
          last_used_at: new Date("2024-03-21T23:00:00Z"),
        },
        {
          ...user.api_keys[1],
          last_used_at: new Date("2024-03-22T00:00:00Z"),
        },
      ])
    })
  })

  it("should register the config path not real one", async () => {
    await runPost("value1", 200)
    await runPost("value2", 200)
    await runPost("value3", 400)

    const attributes = {
      _id: expect.any(ObjectId),
      user_id: user._id,
      api_key_id: user.api_keys[0]._id,
      api_key_env: "production",
      method: "POST",
      path: "/:name",
    }

    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        { ...attributes, date: new Date("2024-03-21T00:00:00Z"), code: 200, type: "success", count: 2 },
        { ...attributes, date: new Date("2024-03-21T00:00:00Z"), code: 400, type: "client_error", count: 1 },
      ])
    })
  })

  it("should increment legacy documents without api_key_env instead of duplicating them", async () => {
    // Document créé avant l'introduction du champ api_key_env : le filtre de l'upsert ne doit pas
    // l'inclure, sinon duplicate key sur l'index unique (method, path, date, user_id, api_key_id, code).
    // L'attendu est {...legacyDoc, count: +1} : le document reste SANS api_key_env, c'est l'assertion centrale.
    const legacyDoc = {
      _id: new ObjectId(),
      user_id: user._id,
      api_key_id: user.api_keys[0]._id,
      method: "GET",
      path: "/",
      date: new Date("2024-03-21T00:00:00Z"),
      code: 200,
      type: "success" as const,
      count: 5,
    }
    await getDbCollection("indicateurs.usage_api").insertOne(legacyDoc)

    const response = await runGet()
    expect.soft(response.statusCode).toBe(200)

    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([{ ...legacyDoc, count: 6 }])
    })
  })

  it("should register api_key_env sandbox for sandbox keys", async () => {
    const sandboxToken = (await generateApiKey("", "sandbox", user)).value
    user = (await getDbCollection("users").findOne({ _id: user._id }))!

    const response = await runGet(sandboxToken)
    expect.soft(response.statusCode).toBe(200)

    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        {
          _id: expect.any(ObjectId),
          user_id: user._id,
          api_key_id: user.api_keys[2]._id,
          api_key_env: "sandbox",
          method: "GET",
          path: "/",
          date: new Date("2024-03-21T00:00:00Z"),
          code: 200,
          type: "success",
          count: 1,
        },
      ])
    })
  })

  it("should not register usage for unauthenticated routes", async () => {
    await runGetPublic()
    expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([])
  })

  it("should support concurrency", async () => {
    const tasks = []
    for (let i = 0; i < 50; i++) {
      tasks.push(runGet())
    }
    await Promise.all(tasks)
    await vi.waitFor(async () => {
      expect(await getDbCollection("indicateurs.usage_api").find().toArray()).toEqual([
        {
          _id: expect.any(ObjectId),
          user_id: user._id,
          api_key_id: user.api_keys[0]._id,
          api_key_env: "production",
          method: "GET",
          path: "/",
          date: new Date("2024-03-21T00:00:00Z"),
          code: 200,
          type: "success",
          count: 50,
        },
      ])
    })
  })
})
