import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import type { ICommune } from "../../../models/index.js";
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

describe("rechercheCommune", () => {
  const code = "59330";
  const response = [
    {
      nom: "Adon",
      code: {
        insee: "45001",
        postaux: ["45230"],
      },
      localisation: {
        centre: {
          type: "Point",
          coordinates: [2.7925, 47.7587],
        },
        bbox: {
          type: "Polygon",
          coordinates: [
            [
              [2.749006, 47.727449],
              [2.835944, 47.727449],
              [2.835944, 47.790032],
              [2.749006, 47.790032],
              [2.749006, 47.727449],
            ],
          ],
        },
      },
      departement: {
        nom: "Loiret",
        codeInsee: "45",
      },
      region: {
        nom: "Centre-Val de Loire",
        codeInsee: "24",
      },
      academie: {
        nom: "Orléans-Tours",
        id: "A18",
        code: "18",
      },
    },
  ];

  it("should call the API with the correct querystring", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/geographie/v1/commune/search")
      .query({ code })
      .reply(200, response);

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.geographie.rechercheCommune({ code });

    expectTypeOf(data).toEqualTypeOf<ICommune[]>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual(response);
  });

  it("should throw an ApiError when server error", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/geographie/v1/commune/search")
      .query({ code })
      .reply(401, {
        statusCode: 401,
        name: "Unauthorized",
        message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource",
      });

    const apiClient = new ApiClient({ key: "api-key" });
    const err = await apiClient.geographie
      .rechercheCommune({ code })
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
      .get("/geographie/v1/commune/search")
      .query({ code })
      .reply(200, { breaking: "schema" });

    const apiClient = new ApiClient({ key: "api-key" });
    const err = await apiClient.geographie
      .rechercheCommune({ code })
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

  it("should accepts future schema ehancements", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/geographie/v1/commune/search")
      .query({ code })
      .reply(
        200,
        response.map((c) => ({
          ...c,
          new_field: "new_field",
        }))
      );

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.geographie.rechercheCommune({ code });

    expectTypeOf(data).toEqualTypeOf<ICommune[]>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual(response);
  });
});
