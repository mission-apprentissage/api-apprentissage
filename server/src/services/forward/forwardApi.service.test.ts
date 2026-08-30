import { parseApiAlternanceToken } from "api-alternance-sdk"
import type { FastifyInstance } from "fastify"
import { fastify } from "fastify"
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock"
import { generateOrganisationFixture } from "shared/models/fixtures/organisation.model.fixture"
import { generateUserFixture } from "shared/models/fixtures/user.model.fixture"
import { beforeEach, describe, expect, it } from "vitest"
import { gzipSync } from "zlib"
import config from "@/config.js"
import { errorMiddleware } from "@/server/middlewares/errorMiddleware.js"
import { forwardApiRequest } from "./forwardApi.service.js"

describe("forwardApi.service", () => {
  const baseUrl = config.api.lba.endpoint

  let app: FastifyInstance

  beforeEach(() => {
    app = fastify()
    errorMiddleware(app)
    disableNetConnect()

    return async () => {
      cleanAll()
      enableNetConnect()
      await app.close()
    }
  })

  const basicUser = generateUserFixture({ email: "basic@exemple.fr", is_admin: false, organisation: null })

  const org = generateOrganisationFixture({ nom: "Org", habilitations: ["jobs:write"] })

  const orgUser = generateUserFixture({ email: "user@exemple.fr", is_admin: false, organisation: org.nom })

  const nockMatchBasicUserAuthorization = () => {
    let token: string = ""

    return {
      matchHeader: (t: string) => {
        token = t
        return true
      },
      expectAuth: async () => {
        return expect.soft(parseApiAlternanceToken({ token, publicKey: config.api.alternance.public_cert })).resolves.toEqual({
          data: {
            email: "basic@exemple.fr",
            habilitations: { "applications:write": false, "appointments:write": false, "jobs:write": false },
            organisation: null,
            env: "production",
          },
          success: true,
        })
      },
    }
  }

  const nockMatchOrgUserAuthorization = () => {
    let token: string = ""

    return {
      matchHeader: (t: string) => {
        token = t
        return true
      },
      expectAuth: async () => {
        return expect.soft(parseApiAlternanceToken({ token, publicKey: config.api.alternance.public_cert })).resolves.toEqual({
          data: {
            email: "user@exemple.fr",
            habilitations: { "applications:write": false, "appointments:write": false, "jobs:write": true },
            organisation: "Org",
            env: "production",
          },
          success: true,
        })
      },
    }
  }

  it("should forward the API request and return the response", async () => {
    const responseBody = { success: true }

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search

      await forwardApiRequest({ path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const { matchHeader, expectAuth } = nockMatchBasicUserAuthorization()
    nock(baseUrl).get("/v3/jobs/search").query({ param: "value" }).matchHeader("Authorization", matchHeader).reply(200, responseBody)

    const response = await app.inject({ method: "GET", url: "/test", query: { param: "value" } })
    await expectAuth()
    expect.soft(response.statusCode).toBe(200)
    expect.soft(response.json()).toEqual(responseBody)
    expect.assertions(3)
  })

  it("should create proper authorization token", async () => {
    const responseBody = { success: true }

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search

      await forwardApiRequest({ path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } }, reply, { user: orgUser, organisation: org, apiKeyEnv: "production" })
    })

    const { matchHeader, expectAuth } = nockMatchOrgUserAuthorization()
    nock(baseUrl).get("/v3/jobs/search").query({ param: "value" }).matchHeader("Authorization", matchHeader).reply(200, responseBody)

    const response = await app.inject({ method: "GET", url: "/test", query: { param: "value" } })
    await expectAuth()

    expect.soft(response.statusCode).toBe(200)
    expect.soft(response.json()).toEqual(responseBody)
  })

  it("should support content-type header", async () => {
    const responseBody = "hello world"

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search

      await forwardApiRequest({ path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const { matchHeader, expectAuth } = nockMatchBasicUserAuthorization()
    nock(baseUrl).get("/v3/jobs/search").query({ param: "value" }).matchHeader("Authorization", matchHeader).reply(200, responseBody, { "content-type": "text/plain" })

    const response = await app.inject({ method: "GET", url: "/test", query: { param: "value" } })
    await expectAuth()

    expect.soft(response.statusCode).toBe(200)
    expect.soft(response.headers).toMatchObject({ "content-type": "text/plain" })
    expect.soft(response.body).toEqual(responseBody)
  })

  // see https://github.com/mswjs/interceptors/pull/704
  it.skip("should support GZIP encoded response", async () => {
    const responseBody = JSON.stringify({ message: "hello world" })
    const compressedResponse = gzipSync(responseBody)

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search

      await forwardApiRequest({ path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const { matchHeader, expectAuth } = nockMatchBasicUserAuthorization()
    nock(baseUrl)
      .get("/v3/jobs/search")
      .query({ param: "value" })
      .matchHeader("Authorization", matchHeader)
      .reply(200, compressedResponse, { "content-type": "application/json", "content-encoding": "gzip" })

    const response = await app.inject({ method: "GET", url: "/test", query: { param: "value" } })
    await expectAuth()

    expect.soft(response.statusCode).toBe(200)
    expect.soft(response.headers).toMatchObject({ "content-type": "application/json" })
    expect.soft(response.body).toEqual(responseBody)
  })

  it("should pass status code", async () => {
    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search

      await forwardApiRequest({ path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const { matchHeader, expectAuth } = nockMatchBasicUserAuthorization()
    nock(baseUrl).get("/v3/jobs/search").matchHeader("Authorization", matchHeader).reply(204, undefined, { "content-type": "text/plain", "x-rate-limit": "100" })

    const response = await app.inject({ method: "GET", url: "/test" })
    await expectAuth()

    expect.soft(response.statusCode).toBe(204)
    expect.soft(response.body).toEqual("")
  })

  it("should support BODY", async () => {
    const payload = { param: "value" }
    const responseBody = { success: true }

    app.post("/test", async (req, reply) => {
      await forwardApiRequest({ path: "/v3/jobs/search", requestInit: { method: "POST", body: JSON.stringify(req.body) } }, reply, {
        user: basicUser,
        organisation: null,
        apiKeyEnv: "production",
      })
    })

    const { matchHeader, expectAuth } = nockMatchBasicUserAuthorization()
    nock(baseUrl).post("/v3/jobs/search", payload).matchHeader("Authorization", matchHeader).reply(200, responseBody)

    const response = await app.inject({ method: "POST", url: "/test", body: payload })
    await expectAuth()

    expect.soft(response.statusCode).toBe(200)
    expect.soft(response.json()).toEqual(responseBody)
  })

  it("should handle unauthorized error", async () => {
    const responseBody = { error: "Forbidden", message: "Invalid JWT token", statusCode: 401 }

    const { matchHeader, expectAuth } = nockMatchBasicUserAuthorization()
    nock(baseUrl).get("/v3/jobs/search").matchHeader("Authorization", matchHeader).reply(401, responseBody, { "content-type": "text/plain", "x-rate-limit": "100" })

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search

      await forwardApiRequest({ path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const response = await app.inject({ method: "GET", url: "/test" })
    await expectAuth()

    expect(response.statusCode).toBe(500)
    expect(response.json()).toEqual({
      message: "The server was unable to complete your request",
      name: "Internal Server Error",
      statusCode: 500,
    })
  })

  it("should forward other errors", async () => {
    const responseBody = { error: "Forbidden", message: "You are not allowed to create a job offer", statusCode: 403 }

    const { matchHeader, expectAuth } = nockMatchBasicUserAuthorization()
    nock(baseUrl).get("/v3/jobs/search").matchHeader("Authorization", matchHeader).reply(403, responseBody, { "content-type": "text/plain", "x-rate-limit": "100" })

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search

      await forwardApiRequest({ path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const response = await app.inject({ method: "GET", url: "/test" })
    await expectAuth()

    expect(response.statusCode).toBe(403)
    expect(response.json()).toEqual(responseBody)
  })

  it("should route sandbox identities to the sandbox endpoint", async () => {
    const responseBody = { success: true }

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search

      await forwardApiRequest({ path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } }, reply, {
        user: basicUser,
        organisation: null,
        apiKeyEnv: "sandbox",
      })
    })

    // Seul l'endpoint sandbox est nocké : un forward vers l'endpoint production ferait échouer le test
    nock(config.api.lba.endpoint_sandbox).get("/v3/jobs/search").query({ param: "value" }).reply(200, responseBody)

    const response = await app.inject({ method: "GET", url: "/test", query: { param: "value" } })

    expect.soft(response.statusCode).toBe(200)
    expect.soft(response.json()).toEqual(responseBody)
  })

  // Forme exacte produite par undici en production : un `TypeError: fetch failed` dont la cause
  // porte le code réseau (cf. labonnealternance#5334).
  const connectionRefused = () =>
    Object.assign(new TypeError("fetch failed"), { cause: Object.assign(new Error("connect ECONNREFUSED 57.128.2.134:443"), { code: "ECONNREFUSED" }) })

  const captureForwardError = () => {
    let error: Error | null = null

    app.addHook("onError", async (_req, _reply, err) => {
      error = err
    })

    return () => error
  }

  it("should replay an idempotent request refused at connection level", async () => {
    const responseBody = { success: true }

    nock(baseUrl).get("/v3/jobs/search").replyWithError(connectionRefused())
    nock(baseUrl).get("/v3/jobs/search").reply(200, responseBody)

    app.get("/test", async (_req, reply) => {
      await forwardApiRequest({ path: "/v3/jobs/search", requestInit: { method: "GET" } }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const response = await app.inject({ method: "GET", url: "/test" })

    expect.soft(response.statusCode).toBe(200)
    expect.soft(response.json()).toEqual(responseBody)
    expect(nock.pendingMocks()).toEqual([])
  })

  it("should not replay a non-idempotent request refused at connection level", async () => {
    nock(baseUrl).post("/v2/appointment").replyWithError(connectionRefused())

    const getError = captureForwardError()

    app.post("/test", async (_req, reply) => {
      await forwardApiRequest(
        { path: "/v2/appointment", requestInit: { method: "POST", body: JSON.stringify({ onisep_id: "AD.10959" }), headers: { "Content-Type": "application/json" } } },
        reply,
        {
          user: basicUser,
          organisation: null,
          apiKeyEnv: "production",
        }
      )
    })

    const response = await app.inject({ method: "POST", url: "/test" })

    expect.soft(response.statusCode).toBe(500)
    expect.soft(nock.pendingMocks()).toEqual([])
    expect(getError()?.message).toBe("forwardApi.getResponse: unexpected error (ECONNREFUSED)")
  })

  it("should not replay an error that is not a connection failure", async () => {
    nock(baseUrl)
      .get("/v3/jobs/search")
      .replyWithError(Object.assign(new TypeError("fetch failed"), { cause: Object.assign(new Error("certificate has expired"), { code: "CERT_HAS_EXPIRED" }) }))

    const getError = captureForwardError()

    app.get("/test", async (_req, reply) => {
      await forwardApiRequest({ path: "/v3/jobs/search", requestInit: { method: "GET" } }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const response = await app.inject({ method: "GET", url: "/test" })

    expect.soft(response.statusCode).toBe(500)
    expect.soft(nock.pendingMocks()).toEqual([])
    // Le code distingue les causes : sans lui, Sentry regroupe TLS, DNS et refus de connexion.
    expect(getError()?.message).toBe("forwardApi.getResponse: unexpected error (CERT_HAS_EXPIRED)")
  })

  it("should return 500 once the replay fails too", async () => {
    nock(baseUrl).get("/v3/jobs/search").replyWithError(connectionRefused())
    nock(baseUrl).get("/v3/jobs/search").replyWithError(connectionRefused())

    app.get("/test", async (_req, reply) => {
      await forwardApiRequest({ path: "/v3/jobs/search", requestInit: { method: "GET" } }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const response = await app.inject({ method: "GET", url: "/test" })

    expect.soft(response.statusCode).toBe(500)
    expect(nock.pendingMocks()).toEqual([])
  })

  it("should give up replaying once the timeout budget is spent", async () => {
    nock(baseUrl).get("/v3/jobs/search").delay(80).replyWithError(connectionRefused())
    nock(baseUrl).get("/v3/jobs/search").reply(200, { success: true })

    app.get("/test", async (_req, reply) => {
      await forwardApiRequest({ path: "/v3/jobs/search", requestInit: { method: "GET" }, timeoutMs: 50 }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const response = await app.inject({ method: "GET", url: "/test" })

    expect.soft(response.statusCode).toBe(504)
    expect(nock.pendingMocks()).toEqual(["GET https://labonnealternance-recette.apprentissage.beta.gouv.fr:443/api/v3/jobs/search"])
  })

  it("should return 504 when the upstream response exceeds timeoutMs", async () => {
    nock(baseUrl).get("/v3/jobs/search").delay(500).reply(200, { success: true })

    app.get("/test", async (_req, reply) => {
      await forwardApiRequest({ path: "/v3/jobs/search", requestInit: { method: "GET" }, timeoutMs: 50 }, reply, { user: basicUser, organisation: null, apiKeyEnv: "production" })
    })

    const response = await app.inject({ method: "GET", url: "/test" })

    expect(response.statusCode).toBe(504)
    expect(response.json()).toEqual({
      message: "The server was unable to complete your request",
      name: "Gateway Time-out",
      statusCode: 504,
    })
  })
})
