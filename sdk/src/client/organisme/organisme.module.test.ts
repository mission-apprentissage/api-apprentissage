import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import type { IRechercheOrganismeResponse } from "../../routes/organisme.routes.js";
import { ApiError } from "../apiError.js";
import { ApiClient } from "../client.js";
import { ApiParseError } from "../parser/response.parser.js";

beforeEach(() => {
  disableNetConnect();

  return () => {
    cleanAll();
    enableNetConnect();
  };
});

describe("recherche", () => {
  const uai = "0594899E";
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

  it("should call the API with the correct querystring", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/organisme/v1/recherche")
      .query({ uai })
      .reply(200, response);

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.organisme.recherche({ uai });

    expectTypeOf(data).toEqualTypeOf<IRechercheOrganismeResponse>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual(response);
  });

  it("should throw an ApiError when server error", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/organisme/v1/recherche")
      .query({ uai })
      .reply(401, {
        statusCode: 401,
        name: "Unauthorized",
        message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource",
      });

    const apiClient = new ApiClient({ key: "api-key" });
    const err = await apiClient.organisme
      .recherche({ uai })
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
      .get("/organisme/v1/recherche")
      .query({ uai })
      .reply(200, { breaking: "schema" });

    const apiClient = new ApiClient({ key: "api-key" });
    const err = await apiClient.organisme
      .recherche({ uai })
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
      .get("/organisme/v1/recherche")
      .query({ uai })
      .reply(200, {
        ...response,
        new_field: "new_field",
      });

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.organisme.recherche({ uai });

    expectTypeOf(data).toEqualTypeOf<IRechercheOrganismeResponse>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual(response);
  });
});
