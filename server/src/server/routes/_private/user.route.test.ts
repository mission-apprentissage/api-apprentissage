import { useMongo } from "@tests/mongo.test.utils.js"
import { decodeJwt } from "jose"
import { ObjectId } from "mongodb"
import { generateUserFixture } from "shared/models/fixtures/index"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import { createSession, createSessionToken } from "@/actions/sessions.actions.js"
import { generateApiKey } from "@/actions/users.actions.js"
import type { Server } from "@/server/server.js"
import createServer from "@/server/server.js"
import { getDbCollection } from "@/services/mongodb/mongodbService.js"

vi.mock("@/services/mailer/mailer", () => {
  return {
    sendEmail: vi.fn(),
  }
})

useMongo()

const now = new Date("2021-10-11T22:00:00.000+00:00")
const in365Days = new Date("2022-10-11T22:00:00.000+00:00")

describe("User Routes", () => {
  let app: Server
  let sessionToken: string
  const user = generateUserFixture({
    email: "connected@exemple.fr",
    is_admin: false,
  })
  const otherUser = generateUserFixture({
    email: "other@exemple.fr",
    is_admin: false,
  })

  beforeAll(async () => {
    app = await createServer()
    await app.ready()

    return () => app.close()
  }, 15_000)

  beforeEach(() => {
    vi.useFakeTimers({ now, toFake: ["Date"] })

    return () => {
      vi.useRealTimers()
    }
  })

  beforeEach(async () => {
    await getDbCollection("users").insertMany([user, otherUser])

    await generateApiKey("", "production", otherUser)
    await generateApiKey("", "production", otherUser)

    sessionToken = await createSessionToken(user.email)
    await createSession(user.email)

    return () => {
      sessionToken = ""
    }
  })

  describe("POST /api/_private/user/api-key", () => {
    it("should create new key with 1 year validity", async () => {
      let userFromDb = await getDbCollection("users").findOne({ _id: user._id })

      expect(userFromDb?.api_keys).toHaveLength(0)

      const response = await app.inject({
        method: "POST",
        url: "/api/_private/user/api-key",
        headers: {
          ["Cookie"]: `api_session=${sessionToken}`,
        },
        body: {
          name: "My key",
        },
      })

      const data = response.json()

      expect(response.statusCode).toBe(200)
      expect(data).toEqual({
        _id: expect.any(String),
        name: "My key",
        env: "sandbox",
        last_used_at: null,
        expires_at: in365Days.toJSON(),
        created_at: now.toJSON(),
        value: expect.any(String),
        expiration_warning_sent: null,
      })

      userFromDb = await getDbCollection("users").findOne({ _id: user._id })
      expect(userFromDb?.api_keys).toEqual([
        {
          _id: expect.any(ObjectId),
          created_at: now,
          expires_at: in365Days,
          key: expect.any(String),
          env: "sandbox",
          last_used_at: null,
          name: "My key",
          expiration_warning_sent: null,
        },
      ])

      const decodedToken = decodeJwt(data.value)
      expect(decodedToken).toEqual({
        _id: user._id.toString(),
        api_key: expect.any(String),
        email: user.email,
        organisation: null,
        env: "sandbox",
        exp: in365Days.getTime() / 1000,
        iat: now.getTime() / 1000,
        iss: "api",
      })
      expect(userFromDb!.api_keys[0].key === (decodedToken as { api_key: string }).api_key).toBe(true)
    })

    it.each([["production"], ["sandbox"]] as const)("should create key with explicit env %s", async (env) => {
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/user/api-key",
        headers: {
          ["Cookie"]: `api_session=${sessionToken}`,
        },
        body: {
          name: "My key",
          env,
        },
      })

      const data = response.json()

      expect(response.statusCode).toBe(200)
      expect(data.env).toBe(env)

      const userFromDb = await getDbCollection("users").findOne({ _id: user._id })
      expect(userFromDb?.api_keys[0].env).toBe(env)
    })

    it("should create key with default unique names", async () => {
      let userFromDb = await getDbCollection("users").findOne({ _id: user._id })
      expect(userFromDb?.api_keys).toHaveLength(0)

      const response1 = await app.inject({
        method: "POST",
        url: "/api/_private/user/api-key",
        headers: {
          ["Cookie"]: `api_session=${sessionToken}`,
        },
        body: {
          name: "",
        },
      })
      const response2 = await app.inject({
        method: "POST",
        url: "/api/_private/user/api-key",
        headers: {
          ["Cookie"]: `api_session=${sessionToken}`,
        },
        body: {
          name: "",
        },
      })
      const response3 = await app.inject({
        method: "POST",
        url: "/api/_private/user/api-key",
        headers: {
          ["Cookie"]: `api_session=${sessionToken}`,
        },
        body: {
          name: "",
        },
      })

      const data1 = response1.json()
      const data2 = response2.json()
      const data3 = response3.json()

      expect(response1.statusCode).toBe(200)
      expect(response2.statusCode).toBe(200)
      expect(response3.statusCode).toBe(200)

      expect(data1.name).not.toEqual(data2.name)
      expect(data1.name).not.toEqual(data3.name)
      expect(data2.name).not.toEqual(data3.name)

      userFromDb = await getDbCollection("users").findOne({ _id: user._id })
      expect(userFromDb?.api_keys).toHaveLength(3)

      const decodedToken1 = decodeJwt(data1.value)
      expect(userFromDb!.api_keys[0].key === (decodedToken1 as { api_key: string }).api_key).toBe(true)
      expect(userFromDb!.api_keys[1].key === (decodedToken1 as { api_key: string }).api_key).toBe(false)
      expect(userFromDb!.api_keys[2].key === (decodedToken1 as { api_key: string }).api_key).toBe(false)
    })

    it("should returns 401 when user is not connected", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/user/api-key",
        headers: {
          ["Cookie"]: `api_session=invalid`,
        },
        body: {
          name: "My key",
        },
      })

      const userResponse = response.json()

      expect(response.statusCode).toBe(401)
      expect(userResponse).toEqual({
        message: "Vous devez être connecté pour accéder à cette ressource",
        name: "Unauthorized",
        statusCode: 401,
      })
    })
  })

  describe("GET /api/_private/user/api-keys", () => {
    it("should get all user keys", async () => {
      await generateApiKey("key1", "production", user)
      await generateApiKey("key2", "production", user)
      await generateApiKey("key3", "production", user)

      const response = await app.inject({
        method: "GET",
        url: "/api/_private/user/api-keys",
        headers: {
          ["Cookie"]: `api_session=${sessionToken}`,
        },
      })

      const data = response.json()

      expect(response.statusCode).toBe(200)
      expect(data).toEqual([
        {
          _id: expect.any(String),
          name: "key1",
          env: "production",
          last_used_at: null,
          expires_at: in365Days.toJSON(),
          created_at: now.toJSON(),
          value: expect.any(String),
          expiration_warning_sent: null,
        },
        {
          _id: expect.any(String),
          name: "key2",
          env: "production",
          last_used_at: null,
          expires_at: in365Days.toJSON(),
          created_at: now.toJSON(),
          value: expect.any(String),
          expiration_warning_sent: null,
        },
        {
          _id: expect.any(String),
          name: "key3",
          env: "production",
          last_used_at: null,
          expires_at: in365Days.toJSON(),
          created_at: now.toJSON(),
          value: expect.any(String),
          expiration_warning_sent: null,
        },
      ])
    })

    it("should returns 401 when user is not connected", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/_private/user/api-keys",
        headers: {
          ["Cookie"]: `api_session=invalid`,
        },
      })

      const userResponse = response.json()

      expect(response.statusCode).toBe(401)
      expect(userResponse).toEqual({
        message: "Vous devez être connecté pour accéder à cette ressource",
        name: "Unauthorized",
        statusCode: 401,
      })
    })
  })

  describe("DELETE /api/_private/user/api-key/:id", () => {
    it("should get all user keys", async () => {
      const key1 = await generateApiKey("key1", "production", user)
      const key2 = await generateApiKey("key2", "production", user)
      const key3 = await generateApiKey("key3", "production", user)

      const response = await app.inject({
        method: "DELETE",
        url: `/api/_private/user/api-key/${key2._id.toString()}`,
        headers: {
          ["Cookie"]: `api_session=${sessionToken}`,
        },
      })

      const data = response.json()

      expect(response.statusCode).toBe(200)
      expect(data).toEqual({ success: true })

      const userFromDb = await getDbCollection("users").findOne({ _id: user._id })

      expect(userFromDb?.api_keys).toHaveLength(2)
      expect(userFromDb?.api_keys).toEqual([
        {
          _id: key1._id,
          name: "key1",
          last_used_at: null,
          expires_at: in365Days,
          created_at: now,
          key: key1.key,
          env: "production",
          expiration_warning_sent: null,
        },
        {
          _id: key3._id,
          name: "key3",
          last_used_at: null,
          expires_at: in365Days,
          created_at: now,
          key: key3.key,
          env: "production",
          expiration_warning_sent: null,
        },
      ])
    })

    it("should returns 401 when user is not connected", async () => {
      const key = await generateApiKey("key1", "production", user)

      const response = await app.inject({
        method: "DELETE",
        url: `/api/_private/user/api-key/${key._id.toString()}`,
        headers: {
          ["Cookie"]: `api_session=invalid`,
        },
      })

      const userResponse = response.json()

      expect(response.statusCode).toBe(401)
      expect(userResponse).toEqual({
        message: "Vous devez être connecté pour accéder à cette ressource",
        name: "Unauthorized",
        statusCode: 401,
      })
    })
  })
})
