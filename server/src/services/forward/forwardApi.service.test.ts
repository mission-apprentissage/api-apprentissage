import { gzipSync } from "zlib";
import { parseApiAlternanceToken } from "api-alternance-sdk";
import type { FastifyInstance } from "fastify";
import { fastify } from "fastify";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { generateOrganisationFixture } from "shared/models/fixtures/organisation.model.fixture";
import { generateUserFixture } from "shared/models/fixtures/user.model.fixture";
import { beforeEach, describe, expect, it } from "vitest";

import { forwardApiRequest } from "./forwardApi.service.js";
import config from "@/config.js";
import { errorMiddleware } from "@/server/middlewares/errorMiddleware.js";

describe("forwardApi.service", () => {
  const baseUrl = "http://example.com/api";

  let app: FastifyInstance;

  beforeEach(() => {
    app = fastify();
    errorMiddleware(app);
    disableNetConnect();

    return () => {
      cleanAll();
      enableNetConnect();
      app.close();
    };
  });

  const basicUser = generateUserFixture({ email: "basic@exemple.fr", is_admin: false, organisation: null });

  const org = generateOrganisationFixture({ nom: "Org", habilitations: ["jobs:write"] });

  const orgUser = generateUserFixture({ email: "user@exemple.fr", is_admin: false, organisation: org.nom });

  const nockMatchBasicUserAuthorization = (token: string) => {
    expect.soft(parseApiAlternanceToken({ token, publicKey: config.api.alternance.public_cert })).toEqual({
      data: {
        email: "basic@exemple.fr",
        habilitations: { "applications:write": false, "appointments:write": false, "jobs:write": false },
        organisation: null,
      },
      success: true,
    });
    return true;
  };

  const nockMatchOrgUserAuthorization = (token: string) => {
    expect.soft(parseApiAlternanceToken({ token, publicKey: config.api.alternance.public_cert })).toEqual({
      data: {
        email: "user@exemple.fr",
        habilitations: { "applications:write": false, "appointments:write": false, "jobs:write": true },
        organisation: "Org",
      },
      success: true,
    });
    return true;
  };

  it("should forward the API request and return the response", async () => {
    const responseBody = { success: true };

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search;

      await forwardApiRequest(
        { endpoint: baseUrl, path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } },
        reply,
        { user: basicUser, organisation: null }
      );
    });

    nock(baseUrl)
      .get("/v3/jobs/search")
      .query({ param: "value" })
      .matchHeader("Authorization", nockMatchBasicUserAuthorization)
      .reply(200, responseBody);

    const response = await app.inject({ method: "GET", url: "/test", query: { param: "value" } });

    expect.soft(response.statusCode).toBe(200);
    expect.soft(response.json()).toEqual(responseBody);
  });

  it("should create proper authorization token", async () => {
    const responseBody = { success: true };

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search;

      await forwardApiRequest(
        { endpoint: baseUrl, path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } },
        reply,
        { user: orgUser, organisation: org }
      );
    });

    nock(baseUrl)
      .get("/v3/jobs/search")
      .query({ param: "value" })
      .matchHeader("Authorization", nockMatchOrgUserAuthorization)
      .reply(200, responseBody);

    const response = await app.inject({ method: "GET", url: "/test", query: { param: "value" } });

    expect.soft(response.statusCode).toBe(200);
    expect.soft(response.json()).toEqual(responseBody);
  });

  it("should support content-type header", async () => {
    const responseBody = "hello world";

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search;

      await forwardApiRequest(
        { endpoint: baseUrl, path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } },
        reply,
        { user: basicUser, organisation: null }
      );
    });

    nock(baseUrl)
      .get("/v3/jobs/search")
      .query({ param: "value" })
      .matchHeader("Authorization", nockMatchBasicUserAuthorization)
      .reply(200, responseBody, { "content-type": "text/plain" });

    const response = await app.inject({ method: "GET", url: "/test", query: { param: "value" } });

    expect.soft(response.statusCode).toBe(200);
    expect.soft(response.headers).toMatchObject({ "content-type": "text/plain" });
    expect.soft(response.body).toEqual(responseBody);
  });

  // see https://github.com/mswjs/interceptors/pull/704
  it.skip("should support GZIP encoded response", async () => {
    const responseBody = JSON.stringify({ message: "hello world" });
    const compressedResponse = gzipSync(responseBody);

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search;

      await forwardApiRequest(
        { endpoint: baseUrl, path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } },
        reply,
        { user: basicUser, organisation: null }
      );
    });

    nock(baseUrl)
      .get("/v3/jobs/search")
      .query({ param: "value" })
      .matchHeader("Authorization", nockMatchBasicUserAuthorization)
      .reply(200, compressedResponse, { "content-type": "application/json", "content-encoding": "gzip" });

    const response = await app.inject({ method: "GET", url: "/test", query: { param: "value" } });

    expect.soft(response.statusCode).toBe(200);
    expect.soft(response.headers).toMatchObject({ "content-type": "application/json" });
    expect.soft(response.body).toEqual(responseBody);
  });

  it("should pass status code", async () => {
    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search;

      await forwardApiRequest(
        { endpoint: baseUrl, path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } },
        reply,
        { user: basicUser, organisation: null }
      );
    });

    nock(baseUrl)
      .get("/v3/jobs/search")
      .matchHeader("Authorization", nockMatchBasicUserAuthorization)
      .reply(204, undefined, { "content-type": "text/plain", "x-rate-limit": "100" });

    const response = await app.inject({ method: "GET", url: "/test" });

    expect.soft(response.statusCode).toBe(204);
    expect.soft(response.body).toEqual("");
  });

  it("should support BODY", async () => {
    const payload = { param: "value" };
    const responseBody = { success: true };

    app.post("/test", async (req, reply) => {
      await forwardApiRequest(
        { endpoint: baseUrl, path: "/v3/jobs/search", requestInit: { method: "POST", body: JSON.stringify(req.body) } },
        reply,
        { user: basicUser, organisation: null }
      );
    });

    nock(baseUrl)
      .post("/v3/jobs/search", payload)
      .matchHeader("Authorization", nockMatchBasicUserAuthorization)
      .reply(200, responseBody);

    const response = await app.inject({ method: "POST", url: "/test", body: payload });

    expect.soft(response.statusCode).toBe(200);
    expect.soft(response.json()).toEqual(responseBody);
  });

  it("should handle unauthorized error", async () => {
    const responseBody = { error: "Forbidden", message: "Invalid JWT token", statusCode: 401 };

    nock(baseUrl)
      .get("/v3/jobs/search")
      .matchHeader("Authorization", nockMatchBasicUserAuthorization)
      .reply(401, responseBody, { "content-type": "text/plain", "x-rate-limit": "100" });

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search;

      await forwardApiRequest(
        { endpoint: baseUrl, path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } },
        reply,
        { user: basicUser, organisation: null }
      );
    });

    const response = await app.inject({ method: "GET", url: "/test" });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      message: "The server was unable to complete your request",
      name: "Internal Server Error",
      statusCode: 500,
    });
  });

  it("should forward other errors", async () => {
    const responseBody = { error: "Forbidden", message: "You are not allowed to create a job offer", statusCode: 403 };

    nock(baseUrl)
      .get("/v3/jobs/search")
      .matchHeader("Authorization", nockMatchBasicUserAuthorization)
      .reply(403, responseBody, { "content-type": "text/plain", "x-rate-limit": "100" });

    app.get("/test", async (req, reply) => {
      const querystring = new URL(req.url, config.apiPublicUrl).search;

      await forwardApiRequest(
        { endpoint: baseUrl, path: "/v3/jobs/search", querystring, requestInit: { method: "GET" } },
        reply,
        { user: basicUser, organisation: null }
      );
    });

    const response = await app.inject({ method: "GET", url: "/test" });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual(responseBody);
  });
});
