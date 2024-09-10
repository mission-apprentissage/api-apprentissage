import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import type { IRechercheOrganismeResponse } from "../routes/organisme.routes.js";
import { ApiError } from "./apiError.js";
import { ApiClient } from "./client.js";

beforeEach(() => {
  disableNetConnect();

  return () => {
    cleanAll();
    enableNetConnect();
  };
});

describe("constructor", () => {
  it("should create an instance of ApiClient", () => {
    const apiClient = new ApiClient({ key: "api-key", endpoint: "https://api-recette.apprentissage.beta.gouv.fr/api" });

    expect(apiClient.endpoint).toBe("https://api-recette.apprentissage.beta.gouv.fr/api");
    expect(apiClient.key).toBe("api-key");
  });

  it('should throw an error if "key" is not provided', () => {
    // @ts-expect-error
    expect(() => new ApiClient({})).toThrow("api-alternance-sdk: api key is required");
  });

  it("should remove trailing slash from endpoint", () => {
    const apiClient = new ApiClient({
      key: "api-key",
      endpoint: "https://api-recette.apprentissage.beta.gouv.fr/api/",
    });
    expect(apiClient.endpoint).toBe("https://api-recette.apprentissage.beta.gouv.fr/api");
  });

  it('should default endpoint to "https://api.apprentissage.beta.gouv.fr/api"', () => {
    const apiClient = new ApiClient({ key: "api-key" });
    expect(apiClient.endpoint).toBe("https://api.apprentissage.beta.gouv.fr/api");
  });
});

describe("get", () => {
  it("execute the request", async () => {
    const response = {
      candidats: [
        {
          correspondances: {
            siret: null,
            uai: {
              lui_meme: true,
              son_lieu: false,
            },
          },
          organisme: {
            identifiant: {
              siret: "26590673500120",
              uai: "0594899E",
            },
          },
          status: {
            declaration_catalogue: true,
            ouvert: false,
            validation_uai: true,
          },
        },
      ],
      metadata: {
        siret: null,
        uai: { status: "ok" },
      },
      resultat: null,
    };

    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/organisme/v1/recherche")
      .query({ uai: "0594899E" })
      .reply(200, response);

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.get("/organisme/v1/recherche", {
      querystring: { uai: "0594899E" },
    });

    expectTypeOf(data).toEqualTypeOf<IRechercheOrganismeResponse>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual(response);
  });

  it("should throw an ApiError when server error", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/certification/v1")
      .query({ "identifiant.rncp": "RNP28704" })
      .reply(400, {
        statusCode: 400,
        name: "Bad Request",
        message: "Request validation failed",
        data: {
          validationError: {
            _errors: [],
            "identifiant.rncp": {
              _errors: ["Invalid"],
            },
          },
        },
      });

    const apiClient = new ApiClient({ key: "api-key" });
    const err = await apiClient
      .get("/certification/v1", {
        querystring: { "identifiant.rncp": "RNP28704" },
      })
      .then(() => {
        expect.unreachable("should throw an error");
      })
      .catch((error: ApiError) => {
        return error;
      });

    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe("Bad Request");
    expect(err.message).toBe("Request validation failed");
    expect(err.context).toEqual({
      errorData: {
        validationError: {
          _errors: [],
          "identifiant.rncp": {
            _errors: ["Invalid"],
          },
        },
      },
      message: "Request validation failed",
      name: "Bad Request",
      params: {},
      path: "/certification/v1",
      querystring: {
        "identifiant.rncp": "RNP28704",
      },
      requestHeaders: {
        authorization: "Bearer api-key",
      },
      responseHeaders: {
        "content-type": "application/json",
      },
      statusCode: 400,
    });

    expect(scope.isDone()).toBe(true);
  });
});

describe.each<["post" | "put" | "delete"]>([["post"], ["put"], ["delete"]])("%s", (method) => {
  it("execute the request", async () => {
    const response = { ok: true };

    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key", "content-type": "application/json" },
    });

    scope[method]("/fake-endpoint", { name: "Moroine" }).reply(200, response);

    const apiClient = new ApiClient({ key: "api-key" });

    // @ts-expect-error routes is not defined is SDK yet
    const data = await apiClient[method]("/fake-endpoint", {
      body: { name: "Moroine" },
    });

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual(response);
  });
});
