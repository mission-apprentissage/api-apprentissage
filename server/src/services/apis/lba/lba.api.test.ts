import type { IJobSearchQuery, IResError } from "api-alternance-sdk";
import { parseApiAlternanceToken } from "api-alternance-sdk";
import type { IJobOfferWritableLba, IJobSearchResponseLba } from "api-alternance-sdk/internal";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { generateOrganisationFixture } from "shared/models/fixtures/organisation.model.fixture";
import { generateUserFixture } from "shared/models/fixtures/user.model.fixture";
import { beforeEach, describe, expect, it } from "vitest";

import config from "@/config.js";
import { formatResponseError } from "@/server/middlewares/errorMiddleware.js";

import { createJobOfferLba, searchJobOpportunitiesLba, updateJobOfferLba } from "./lba.api.js";

beforeEach(() => {
  disableNetConnect();

  return () => {
    cleanAll();
    enableNetConnect();
  };
});

describe("searchJobOpportunities", () => {
  const data: IJobSearchResponseLba = {
    jobs: [
      {
        _id: "1",
        apply_phone: "0300000000",
        apply_url: "https://postler.com",
        contract_duration: 12,
        contract_remote: "onsite",
        contract_start: new Date("2021-01-28T15:00:00.000Z"),
        contract_type: ["Apprentissage"],
        offer_access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
        offer_creation: new Date("2021-01-01T00:00:00.000Z"),
        offer_description: "Exécute des travaux administratifs courants",
        offer_desired_skills: ["Faire preuve de rigueur et de précision"],
        offer_expiration: new Date("2021-03-28T15:00:00.000Z"),
        offer_opening_count: 1,
        offer_rome_codes: ["M1602"],
        offer_status: "Active",
        offer_target_diploma: {
          european: "4",
          label: "BP, Bac, autres formations niveau (Bac)",
        },
        offer_title: "Opérations administratives",
        offer_to_be_acquired_skills: [
          "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
          "Production, Fabrication: Réaliser des travaux de reprographie",
          "Organisation: Contrôler la conformité des données ou des documents",
        ],
        partner_label: "La bonne alternance",
        partner_job_id: null,
        workplace_address_label: "Paris",
        workplace_brand: "Brand",
        workplace_description: "Workplace Description",
        workplace_geopoint: {
          coordinates: [2.347, 48.8589],
          type: "Point",
        },
        workplace_idcc: 1242,
        workplace_legal_name: "ASSEMBLEE NATIONALE",
        workplace_naf_code: "84.11Z",
        workplace_naf_label: "Autorité constitutionnelle",
        workplace_name: "ASSEMBLEE NATIONALE",
        workplace_opco: "",
        workplace_siret: "11000001500013",
        workplace_size: null,
        workplace_website: null,
      },
    ],
    recruiters: [
      {
        _id: "42",
        apply_phone: "0100000000",
        apply_url: "http://localhost:3000/recherche-apprentissage?type=lba&itemId=11000001500013",
        workplace_address_label: "126 RUE DE L'UNIVERSITE 75007 PARIS",
        workplace_brand: "ASSEMBLEE NATIONALE - La vraie",
        workplace_description: null,
        workplace_geopoint: {
          coordinates: [2.347, 48.8589],
          type: "Point",
        },
        workplace_idcc: null,
        workplace_legal_name: "ASSEMBLEE NATIONALE",
        workplace_naf_code: "8411Z",
        workplace_naf_label: "Administration publique générale",
        workplace_name: "ASSEMBLEE NATIONALE - La vraie",
        workplace_opco: null,
        workplace_siret: "11000001500013",
        workplace_size: null,
        workplace_website: null,
      },
    ],
    warnings: [
      {
        code: "FRANCE_TRAVAIL_API_ERROR",
        message: "Unable to retrieve job offers from France Travail API",
      },
    ],
  };

  const user = generateUserFixture({
    email: "basic@exemple.fr",
    is_admin: false,
    organisation: null,
  });

  const expectedBasicUserToken = {
    email: "basic@exemple.fr",
    habilitations: {
      "jobs:write": false,
    },
    organisation: null,
  };

  it("should return correcty parsed data", async () => {
    const query: IJobSearchQuery = {};

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v2/jobs/search")
      .query(query)
      .matchHeader("authorization", (token) => {
        expect
          .soft(
            parseApiAlternanceToken({
              token,
              publicKey: config.api.alternance.public_cert,
            })
          )
          .toEqual({
            data: expectedBasicUserToken,
            success: true,
          });
        return true;
      })
      .reply(200, data);

    await expect(searchJobOpportunitiesLba(query, user, null)).resolves.toEqual(data);
    expect(nock.isDone());
    expect.assertions(3);
  });

  it("should support query params", async () => {
    const query: Required<IJobSearchQuery> = {
      longitude: -4.6,
      latitude: 42.85,
      radius: 60,
      target_diploma_level: "3",
      romes: "I1401,I1306",
      rncp: "RNCP38654",
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v2/jobs/search")
      .query(query)
      .matchHeader("authorization", (token) => {
        expect
          .soft(
            parseApiAlternanceToken({
              token,
              publicKey: config.api.alternance.public_cert,
            })
          )
          .toEqual({
            data: expectedBasicUserToken,
            success: true,
          });
        return true;
      })
      .reply(200, data);

    await expect(searchJobOpportunitiesLba(query, user, null)).resolves.toEqual(data);
    expect(nock.isDone());
    expect.assertions(3);
  });

  it("should throw internal error when schema is not valid", async () => {
    const query: IJobSearchQuery = {};

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v2/jobs/search")
      .query(query)
      .reply(200, {});

    await expect(searchJobOpportunitiesLba(query, user, null)).rejects.toMatchObject({
      isBoom: true,
      output: {
        statusCode: 500,
      },
    });
    expect(nock.isDone());
  });

  it("should throw internal when network error", async () => {
    const query: IJobSearchQuery = {};

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v2/jobs/search")
      .query(query)
      .replyWithError("Oops");

    await expect(searchJobOpportunitiesLba(query, user, null)).rejects.toMatchObject({
      isBoom: true,
      output: {
        statusCode: 500,
      },
    });

    expect(nock.isDone());
  });

  it("should throw internal when server error on LBA", async () => {
    const query: IJobSearchQuery = {};

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v2/jobs/search")
      .query(query)
      .reply(500, {
        error: "Internal",
        message: "Internal Server error",
        statusCode: 500,
      });

    await expect(searchJobOpportunitiesLba(query, user, null)).rejects.toMatchObject({
      isBoom: true,
      output: {
        statusCode: 500,
      },
    });

    expect(nock.isDone());
  });

  it("should throw client error when 400 error on LBA", async () => {
    const query: IJobSearchQuery = {};

    const lbaError = {
      data: {
        validationError: {
          _errors: [],
          romes: {
            _errors: ["One or more ROME codes are invalid. Expected format is 'D1234'."],
          },
        },
      },
      error: "Bad Request",
      message: "Request validation failed",
      statusCode: 400,
    };

    const expectedError: IResError = {
      data: lbaError.data,
      name: "Bad Request",
      message: lbaError.message,
      statusCode: 400,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v2/jobs/search")
      .query(query)
      .reply(400, lbaError);

    const e = await searchJobOpportunitiesLba(query, user, null).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);

    expect(nock.isDone());
  });

  // This one is due to API, so it's server error
  it("should throw server error when 401 error on LBA", async () => {
    const query: IJobSearchQuery = {};

    const lbaError = { error: "Forbidden", message: "Invalid JWT token", statusCode: 401 };

    const expectedError: IResError = {
      message: "The server was unable to complete your request",
      name: "Internal Server Error",
      statusCode: 500,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v2/jobs/search")
      .query(query)
      .reply(401, lbaError);

    const e = await searchJobOpportunitiesLba(query, user, null).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);
    expect(e.data).toEqual(lbaError);
    expect(e.message).toBe("api.lba: LBA client error");

    expect(nock.isDone());
  });

  it("should throw client error when 403 error on LBA", async () => {
    const query: IJobSearchQuery = {};

    const lbaError = { error: "Forbidden", message: "You are not allowed to create a job offer", statusCode: 403 };

    const expectedError: IResError = {
      message: lbaError.message,
      name: "Forbidden",
      statusCode: 403,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v2/jobs/search")
      .query(query)
      .reply(403, lbaError);

    const e = await searchJobOpportunitiesLba(query, user, null).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);

    expect(nock.isDone());
  });

  it("should throw client error when 404 error on LBA", async () => {
    const query: IJobSearchQuery = {};

    const lbaError = { error: "Not found", message: "Resource not found", statusCode: 403 };

    const expectedError: IResError = {
      message: lbaError.message,
      name: "Not Found",
      statusCode: 404,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v2/jobs/search")
      .query(query)
      .reply(404, lbaError);

    const e = await searchJobOpportunitiesLba(query, user, null).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);

    expect(nock.isDone());
  });
});

describe("createJobOfferLba", () => {
  const minimalData: IJobOfferWritableLba = {
    offer_title: "Opérations administratives",
    workplace_siret: "11000001500013",
    offer_description: "Exécute des travaux administratifs courants",
  };

  const user = generateUserFixture({
    email: "basic@exemple.fr",
    is_admin: false,
    organisation: null,
  });

  const userRo = generateUserFixture({
    email: "ro@exemple.fr",
    is_admin: false,
    organisation: "ReadOnly",
  });

  const userWrite = generateUserFixture({
    email: "write@exemple.fr",
    is_admin: false,
    organisation: "WriteOnly",
  });

  const orgRo = generateOrganisationFixture({
    nom: "ReadOnly",
    habilitations: [],
  });

  const orgWrite = generateOrganisationFixture({
    nom: "WriteOnly",
    habilitations: ["jobs:write"],
  });

  const expectedBasicUserToken = {
    email: "basic@exemple.fr",
    habilitations: {
      "jobs:write": false,
    },
    organisation: null,
  };

  const expectedRoUserToken = {
    email: "ro@exemple.fr",
    habilitations: {
      "jobs:write": false,
    },
    organisation: orgRo.nom,
  };

  const expectedWriteUserToken = {
    email: "write@exemple.fr",
    habilitations: {
      "jobs:write": true,
    },
    organisation: orgWrite.nom,
  };

  it.each([
    [user, orgRo, expectedBasicUserToken],
    [userRo, orgRo, expectedRoUserToken],
    [userWrite, orgWrite, expectedWriteUserToken],
  ])("should send correct data", async (u, o, t) => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/jobs", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .matchHeader("authorization", (token) => {
        expect
          .soft(
            parseApiAlternanceToken({
              token,
              publicKey: config.api.alternance.public_cert,
            })
          )
          .toEqual({
            data: t,
            success: true,
          });
        return true;
      })
      .reply(200, { id: "1" });

    await expect(createJobOfferLba(minimalData, u, o)).resolves.toEqual({ id: "1" });
    expect(nock.isDone());
    expect.assertions(4);
  });

  it("should throw internal error when schema is not valid", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/jobs", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(200, {});

    await expect(createJobOfferLba(minimalData, userWrite, orgWrite)).rejects.toMatchObject({
      isBoom: true,
      output: {
        statusCode: 500,
      },
    });
    expect(nock.isDone());
  });

  it("should throw internal when network error", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/jobs", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .replyWithError("Oops");

    await expect(createJobOfferLba(minimalData, userWrite, orgWrite)).rejects.toMatchObject({
      isBoom: true,
      output: {
        statusCode: 500,
      },
    });

    expect(nock.isDone());
  });

  it("should throw internal when server error on LBA", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/jobs", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(500, {
        error: "Internal",
        message: "Internal Server error",
        statusCode: 500,
      });

    await expect(createJobOfferLba(minimalData, userWrite, orgWrite)).rejects.toMatchObject({
      isBoom: true,
      output: {
        statusCode: 500,
      },
    });

    expect(nock.isDone());
  });

  it("should throw client error when 400 error on LBA", async () => {
    const lbaError = {
      statusCode: 400,
      error: "Bad Request",
      message: "Request validation failed",
      data: {
        validationError: {
          _errors: [],
          offer_title: {
            _errors: ["String attendu"],
          },
          offer_description: {
            _errors: ["String attendu"],
          },
          workplace_siret: {
            _errors: ["String attendu"],
          },
        },
      },
    };

    const expectedError: IResError = {
      data: lbaError.data,
      name: "Bad Request",
      message: lbaError.message,
      statusCode: 400,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/jobs", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(400, lbaError);

    const e = await createJobOfferLba(minimalData, userWrite, orgWrite).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);

    expect(nock.isDone());
  });

  // This one is due to API, so it's server error
  it("should throw server error when 401 error on LBA", async () => {
    const lbaError = { error: "Forbidden", message: "Invalid JWT token", statusCode: 401 };

    const expectedError: IResError = {
      message: "The server was unable to complete your request",
      name: "Internal Server Error",
      statusCode: 500,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/jobs", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(401, lbaError);

    const e = await createJobOfferLba(minimalData, userWrite, orgWrite).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);
    expect(e.data).toEqual(lbaError);
    expect(e.message).toBe("api.lba: LBA client error");

    expect(nock.isDone());
  });

  it("should throw client error when 403 error on LBA", async () => {
    const lbaError = { error: "Forbidden", message: "You are not allowed to create a job offer", statusCode: 403 };

    const expectedError: IResError = {
      message: lbaError.message,
      name: "Forbidden",
      statusCode: 403,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/jobs", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(403, lbaError);

    const e = await createJobOfferLba(minimalData, userWrite, orgWrite).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);

    expect(nock.isDone());
  });

  it("should throw client error when 404 error on LBA", async () => {
    const lbaError = { error: "Not found", message: "Resource not found", statusCode: 403 };

    const expectedError: IResError = {
      message: lbaError.message,
      name: "Not Found",
      statusCode: 404,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/jobs", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(404, lbaError);

    const e = await createJobOfferLba(minimalData, userWrite, orgWrite).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);

    expect(nock.isDone());
  });
});

describe("updateJobOfferLba", () => {
  const minimalData: IJobOfferWritableLba = {
    offer_title: "Opérations administratives",
    workplace_siret: "11000001500013",
    offer_description: "Exécute des travaux administratifs courants",
  };

  const user = generateUserFixture({
    email: "basic@exemple.fr",
    is_admin: false,
    organisation: null,
  });

  const userRo = generateUserFixture({
    email: "ro@exemple.fr",
    is_admin: false,
    organisation: "ReadOnly",
  });

  const userWrite = generateUserFixture({
    email: "write@exemple.fr",
    is_admin: false,
    organisation: "WriteOnly",
  });

  const orgRo = generateOrganisationFixture({
    nom: "ReadOnly",
    habilitations: [],
  });

  const orgWrite = generateOrganisationFixture({
    nom: "WriteOnly",
    habilitations: ["jobs:write"],
  });

  const expectedBasicUserToken = {
    email: "basic@exemple.fr",
    habilitations: {
      "jobs:write": false,
    },
    organisation: null,
  };

  const expectedRoUserToken = {
    email: "ro@exemple.fr",
    habilitations: {
      "jobs:write": false,
    },
    organisation: orgRo.nom,
  };

  const expectedWriteUserToken = {
    email: "write@exemple.fr",
    habilitations: {
      "jobs:write": true,
    },
    organisation: orgWrite.nom,
  };

  it.each([
    [user, orgRo, expectedBasicUserToken],
    [userRo, orgRo, expectedRoUserToken],
    [userWrite, orgWrite, expectedWriteUserToken],
  ])("should send correct data", async (u, o, t) => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .put("/v2/jobs/1234", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .matchHeader("authorization", (token) => {
        expect
          .soft(
            parseApiAlternanceToken({
              token,
              publicKey: config.api.alternance.public_cert,
            })
          )
          .toEqual({
            data: t,
            success: true,
          });
        return true;
      })
      .reply(204);

    await expect(updateJobOfferLba("1234", minimalData, u, o)).resolves.toBeUndefined();
    expect(nock.isDone());
    expect.assertions(4);
  });

  it("should throw internal when network error", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .put("/v2/jobs/1234", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .replyWithError("Oops");

    await expect(updateJobOfferLba("1234", minimalData, userWrite, orgWrite)).rejects.toMatchObject({
      isBoom: true,
      output: {
        statusCode: 500,
      },
    });

    expect(nock.isDone());
  });

  it("should throw internal when server error on LBA", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .put("/v2/jobs/1234", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(500, {
        error: "Internal",
        message: "Internal Server error",
        statusCode: 500,
      });

    await expect(updateJobOfferLba("1234", minimalData, userWrite, orgWrite)).rejects.toMatchObject({
      isBoom: true,
      output: {
        statusCode: 500,
      },
    });

    expect(nock.isDone());
  });

  it("should throw client error when 400 error on LBA", async () => {
    const lbaError = {
      statusCode: 400,
      error: "Bad Request",
      message: "Request validation failed",
      data: {
        validationError: {
          _errors: [],
          offer_title: {
            _errors: ["String attendu"],
          },
          offer_description: {
            _errors: ["String attendu"],
          },
          workplace_siret: {
            _errors: ["String attendu"],
          },
        },
      },
    };

    const expectedError: IResError = {
      data: lbaError.data,
      name: "Bad Request",
      message: lbaError.message,
      statusCode: 400,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .put("/v2/jobs/1234", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(400, lbaError);

    const e = await updateJobOfferLba("1234", minimalData, userWrite, orgWrite).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);

    expect(nock.isDone());
  });

  // This one is due to API, so it's server error
  it("should throw server error when 401 error on LBA", async () => {
    const lbaError = { error: "Forbidden", message: "Invalid JWT token", statusCode: 401 };

    const expectedError: IResError = {
      message: "The server was unable to complete your request",
      name: "Internal Server Error",
      statusCode: 500,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .put("/v2/jobs/1234", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(401, lbaError);

    const e = await updateJobOfferLba("1234", minimalData, userWrite, orgWrite).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);
    expect(e.data).toEqual(lbaError);
    expect(e.message).toBe("api.lba: LBA client error");

    expect(nock.isDone());
  });

  it("should throw client error when 403 error on LBA", async () => {
    const lbaError = { error: "Forbidden", message: "You are not allowed to create a job offer", statusCode: 403 };

    const expectedError: IResError = {
      message: lbaError.message,
      name: "Forbidden",
      statusCode: 403,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .put("/v2/jobs/1234", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(403, lbaError);

    const e = await updateJobOfferLba("1234", minimalData, userWrite, orgWrite).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);

    expect(nock.isDone());
  });

  it("should throw client error when 404 error on LBA", async () => {
    const lbaError = { error: "Not found", message: "Resource not found", statusCode: 403 };

    const expectedError: IResError = {
      message: lbaError.message,
      name: "Not Found",
      statusCode: 404,
    };

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .put("/v2/jobs/1234", (body) => {
        expect.soft(body).toEqual(minimalData);
        return true;
      })
      .reply(404, lbaError);

    const e = await updateJobOfferLba("1234", minimalData, userWrite, orgWrite).catch((e) => e);
    expect(e.isBoom).toBe(true);
    expect(formatResponseError(e)).toEqual(expectedError);

    expect(nock.isDone());
  });
});
