import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import { generateFormationFixture } from "../../../fixtures.js";
import type { IFormation } from "../../../models/index.js";
import type { IFormationSearchApiResult } from "../../../routes/index.js";
import { ApiClient } from "../../client.js";
import { ApiError } from "../apiError.js";
import { ApiParseError } from "../parser/response.parser.js";

beforeEach(() => {
  disableNetConnect();

  return () => {
    cleanAll();
    enableNetConnect();
  };
});

describe("recherche", () => {
  it("should call the API with the correct querystring", async () => {
    const response: IFormationSearchApiResult = {
      data: [generateFormationFixture()],
      pagination: {
        page_count: 1,
        page_index: 0,
        page_size: 1,
      },
    };

    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/formation/v1/search")
      .query("page_index=0")
      .reply(200, response);

    const apiClient = new ApiClient({ key: "api-key" });

    const cursor = apiClient.formation.recherche({});
    const data = [];
    for await (const page of cursor) {
      data.push(...page);
    }

    expectTypeOf(data).toEqualTypeOf<IFormation[]>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual(response.data);
  });

  it("should support multiple pages conserving query string", async () => {
    const expectedData = [
      generateFormationFixture({ identifiant: { cle_ministere_educatif: "#1" } }),
      generateFormationFixture({ identifiant: { cle_ministere_educatif: "#2" } }),
      generateFormationFixture({ identifiant: { cle_ministere_educatif: "#3" } }),
    ];
    const responses: IFormationSearchApiResult[] = [
      {
        data: [expectedData[0]],
        pagination: {
          page_count: 3,
          page_index: 0,
          page_size: 1,
        },
      },
      {
        data: [expectedData[1]],
        pagination: {
          page_count: 3,
          page_index: 1,
          page_size: 1,
        },
      },
      {
        data: [expectedData[2]],
        pagination: {
          page_count: 3,
          page_index: 2,
          page_size: 1,
        },
      },
    ];

    const expectedQs =
      "longitude=-4.6&latitude=42.85&radius=60&target_diploma_level=3&romes=I1401,I1306&rncp=RNCP38654&page_size=1";

    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/formation/v1/search")
      .query(`page_index=0&${expectedQs}`)
      .reply(200, responses[0]);

    scope.get("/formation/v1/search").query(`page_index=1&${expectedQs}`).reply(200, responses[1]);

    scope.get("/formation/v1/search").query(`page_index=2&${expectedQs}`).reply(200, responses[2]);

    const apiClient = new ApiClient({ key: "api-key" });

    const cursor = apiClient.formation.recherche({
      longitude: -4.6,
      latitude: 42.85,
      radius: 60,
      target_diploma_level: "3",
      romes: "I1401,I1306",
      rncp: "RNCP38654",
      page_size: 1,
    });

    const data = [];
    for await (const page of cursor) {
      data.push(...page);
    }

    expectTypeOf(data).toEqualTypeOf<IFormation[]>();

    expect(data).toEqual(expectedData);
    expect(scope.isDone()).toBe(true);
  });

  it("should support include_archived=true query param", async () => {
    const response: IFormationSearchApiResult = {
      data: [generateFormationFixture()],
      pagination: {
        page_count: 1,
        page_index: 0,
        page_size: 1,
      },
    };

    const expectedQs = "include_archived=true&page_size=1";

    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/formation/v1/search")
      .query(`page_index=0&${expectedQs}`)
      .reply(200, response);

    const apiClient = new ApiClient({ key: "api-key" });

    const cursor = apiClient.formation.recherche({
      page_size: 1,
      include_archived: "true",
    });

    const data = [];
    for await (const page of cursor) {
      data.push(...page);
    }

    expectTypeOf(data).toEqualTypeOf<IFormation[]>();

    expect(data).toEqual(response.data);
    expect(scope.isDone()).toBe(true);
  });

  it("should throw an ApiError when server error", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/formation/v1/search")
      .query("page_index=0")
      .reply(401, {
        statusCode: 401,
        name: "Unauthorized",
        message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource",
      });

    const apiClient = new ApiClient({ key: "api-key" });
    const cursor = apiClient.formation.recherche({});

    const err = await cursor
      .next()
      .then(() => {
        expect.unreachable("should throw an error");
      })
      .catch((error: ApiError) => {
        return error;
      });

    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe("Unauthorized");

    expect(scope.isDone()).toBe(true);
  });

  it("should throw if the response does not match the schema", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/formation/v1/search")
      .query("page_index=0")
      .reply(200, { breaking: "schema" });

    const apiClient = new ApiClient({ key: "api-key" });
    const cursor = apiClient.formation.recherche({});
    const err = await cursor
      .next()
      .then(() => {
        expect.unreachable("should throw an error");
      })
      .catch((error: ApiError) => {
        return error;
      });

    expect(err).toBeInstanceOf(ApiParseError);
    expect(err.name).toBe("ApiParseError");
    expect(err.message).toMatchSnapshot();

    expect(scope.isDone()).toBe(true);
  });
});
