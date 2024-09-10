import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import type { IJobSearchQuery, IJobSearchResponse } from "../../routes/job.routes.js";
import { ApiError } from "../apiError.js";
import { ApiClient } from "../client.js";
import { ApiParseError } from "../parser/response.parser.js";
import type { JobSearchFilter } from "./job.module.js";

beforeEach(() => {
  disableNetConnect();

  return () => {
    cleanAll();
    enableNetConnect();
  };
});

describe("search", () => {
  const response: IJobSearchResponse = {
    jobs: [
      {
        identifier: {
          id: "1",
          partner: "La bonne alternance",
          partner_job_id: null,
        },
        workplace: {
          siret: "11000001500013",
          brand: "Brand",
          legal_name: "ASSEMBLEE NATIONALE",
          website: null,
          name: "ASSEMBLEE NATIONALE",
          description: "Workplace Description",
          size: null,
          address: {
            label: "Paris",
          },
          geopoint: {
            coordinates: [2.347, 48.8589],
            type: "Point",
          },
          idcc: 1242,
          opco: "",
          naf: {
            code: "84.11Z",
            label: "Autorité constitutionnelle",
          },
        },
        apply: {
          url: "https://postler.com",
          phone: "0300000000",
        },
        contract: {
          start: new Date("2021-01-28T16:00:00.000+01:00"),
          duration: 12,
          type: ["Apprentissage"],
          remote: "onsite",
        },
        offer: {
          title: "Opérations administratives",
          rome_codes: ["M1602"],
          description: "Exécute des travaux administratifs courants",
          target_diploma: {
            european: "4",
            label: "BP, Bac, autres formations niveau (Bac)",
          },
          desired_skills: ["Faire preuve de rigueur et de précision"],
          to_be_acquired_skills: [
            "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
            "Production, Fabrication: Réaliser des travaux de reprographie",
            "Organisation: Contrôler la conformité des données ou des documents",
          ],
          access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
          creation: new Date("2021-01-01T01:00:00.000+01:00"),
          expiration: new Date("2021-03-28T17:00:00.000+02:00"),
          opening_count: 1,
          status: "Active",
        },
      },
    ],
    recruiters: [
      {
        identifier: {
          id: "42",
        },
        workplace: {
          siret: "11000001500013",
          brand: "ASSEMBLEE NATIONALE - La vraie",
          legal_name: "ASSEMBLEE NATIONALE",
          website: null,
          name: "ASSEMBLEE NATIONALE - La vraie",
          description: null,
          size: null,
          address: {
            label: "126 RUE DE L'UNIVERSITE 75007 PARIS",
          },
          geopoint: {
            coordinates: [2.347, 48.8589],
            type: "Point",
          },
          idcc: null,
          opco: null,
          naf: {
            code: "8411Z",
            label: "Administration publique générale",
          },
        },
        apply: {
          url: "http://localhost:3000/recherche-apprentissage?type=lba&itemId=11000001500013",
          phone: "0100000000",
        },
      },
    ],
    warnings: [
      {
        code: "FRANCE_TRAVAIL_API_ERROR",
        message: "Unable to retrieve job offers from France Travail API",
      },
    ],
  };

  const query: Required<IJobSearchQuery> = {
    longitude: -4.6,
    latitude: 42.85,
    radius: 60,
    target_diploma_level: "3",
    romes: "I1401,I1306",
    rncp: "RNCP38654",
  };
  const filter: JobSearchFilter = {
    longitude: -4.6,
    latitude: 42.85,
    radius: 60,
    target_diploma_level: "3",
    romes: ["I1401", "I1306"],
    rncp: "RNCP38654",
  };

  it("should call the API with the correct querystring", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/job/v1/search")
      .query(query)
      .reply(200, response);

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.job.search(filter);

    expectTypeOf(data).toEqualTypeOf<IJobSearchResponse>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual(response);
  });

  it("should throw an ApiError when server error", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/job/v1/search")
      .query(query)
      .reply(401, {
        statusCode: 401,
        name: "Unauthorized",
        message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource",
      });

    const apiClient = new ApiClient({ key: "api-key" });
    const err = await apiClient.job
      .search(filter)
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
      .get("/job/v1/search")
      .query(query)
      .reply(200, { breaking: "schema" });

    const apiClient = new ApiClient({ key: "api-key" });
    const err = await apiClient.job
      .search(filter)
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
      .get("/job/v1/search")
      .query(query)
      .reply(200, {
        ...response,
        new_field: "new_field",
      });

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.job.search(filter);

    expectTypeOf(data).toEqualTypeOf<IJobSearchResponse>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual(response);
  });
});
