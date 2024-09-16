import type { Boom } from "@hapi/boom";
import { badRequest, forbidden, internal, notFound } from "@hapi/boom";
import { useMongo } from "@tests/mongo.test.utils.js";
import type { IJobOfferWritable, IJobSearchResponse, IResError } from "api-alternance-sdk";
import type { IJobOfferWritableLba, IJobSearchResponseLba } from "api-alternance-sdk/internal";
import { generateOrganisationFixture, generateUserFixture } from "shared/models/fixtures/index";
import type { Jsonify, RequiredDeep, RequiredKeysOf } from "type-fest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { generateApiKey } from "@/actions/users.actions.js";
import type { Server } from "@/server/server.js";
import createServer from "@/server/server.js";
import { createJobOfferLba, searchJobOpportunitiesLba } from "@/services/apis/lba/lba.api.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

useMongo();

vi.mock("@/services/apis/lba/lba.api.js");

describe("GET /job/v1/search", () => {
  let app: Server;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    return () => app.close();
  }, 15_000);

  let token: string;

  const user = generateUserFixture({
    email: "user@exemple.fr",
    is_admin: false,
  });

  beforeEach(async () => {
    await getDbCollection("users").insertOne(user);
    token = (await generateApiKey("", user)).value;
  });

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/job/v1/search",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource",
    });
  });

  it("should returns 401 if api key is invalid", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/job/v1/search",
      headers: {
        Authorization: `Bearer ${token}invalid`,
      },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource",
    });
  });

  it("should return result from lba search", async () => {
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
          workplace_address: {
            label: "Paris",
          },
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
          workplace_address: {
            label: "126 RUE DE L'UNIVERSITE 75007 PARIS",
          },
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

    const expectedData: Jsonify<IJobSearchResponse> = {
      jobs: [
        {
          identifier: {
            id: "1",
            partner_label: "La bonne alternance",
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
            start: "2021-01-28T16:00:00.000+01:00",
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
            creation: "2021-01-01T01:00:00.000+01:00",
            expiration: "2021-03-28T17:00:00.000+02:00",
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

    vi.mocked(searchJobOpportunitiesLba).mockResolvedValue(data);

    const response = await app.inject({
      method: "GET",
      url: `/api/job/v1/search?longitude=-4.6&latitude=42.85&radius=60&target_diploma_level=3&romes=I1401,I1306&rncp=RNCP38654`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect(result).toEqual(expectedData);
    expect(searchJobOpportunitiesLba).toHaveBeenCalledOnce();

    expect(searchJobOpportunitiesLba).toHaveBeenCalledWith(
      {
        longitude: -4.6,
        latitude: 42.85,
        radius: 60,
        target_diploma_level: "3",
        romes: "I1401,I1306",
        rncp: "RNCP38654",
      },
      expect.objectContaining({
        _id: user._id,
        email: user.email,
        organisation: user.organisation,
      }),
      null
    );
  });

  it.each<[number, IResError, (messageOrError?: string | Error, data?: unknown) => Boom<unknown>]>([
    [
      400,
      {
        data: {
          validationError: {
            _errors: [],
            romes: {
              _errors: ["One or more ROME codes are invalid. Expected format is 'D1234'."],
            },
          },
        },
        message: "Request validation failed",
        name: "Bad Request",
        statusCode: 400,
      },
      badRequest,
    ],
    [
      403,
      {
        message: "You are not allowed to create a job offer",
        name: "Forbidden",
        statusCode: 403,
      },
      forbidden,
    ],
    [
      404,
      {
        message: "Resource not found",
        name: "Not Found",
        statusCode: 404,
      },
      notFound,
    ],
  ])("should throw back %s errors", async (statusCode, expectedError, errorBuilder) => {
    vi.mocked(searchJobOpportunitiesLba).mockRejectedValue(errorBuilder(expectedError.message, expectedError.data));

    const response = await app.inject({
      method: "GET",
      url: `/api/job/v1/search`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect.soft(response.statusCode).toBe(statusCode);
    const result = response.json();
    expect(result).toEqual(expectedError);
    expect(searchJobOpportunitiesLba).toHaveBeenCalledOnce();

    expect(searchJobOpportunitiesLba).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        _id: user._id,
        email: user.email,
        organisation: user.organisation,
      }),
      null
    );
  });

  it("should throw back 500 without details", async () => {
    const expectedError: IResError = {
      message: "The server was unable to complete your request",
      name: "Internal Server Error",
      statusCode: 500,
    };

    const sensitiveData = {
      value: 42,
    };

    vi.mocked(searchJobOpportunitiesLba).mockRejectedValue(internal("Some sensitive message", sensitiveData));

    const response = await app.inject({
      method: "GET",
      url: `/api/job/v1/search`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect.soft(response.statusCode).toBe(500);
    const result = response.json();
    expect(result).toEqual(expectedError);
    expect(searchJobOpportunitiesLba).toHaveBeenCalledOnce();

    expect(searchJobOpportunitiesLba).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        _id: user._id,
        email: user.email,
        organisation: user.organisation,
      }),
      null
    );
  });
});
describe("POST /job/v1/offer", () => {
  let app: Server;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    return () => app.close();
  }, 15_000);

  let token: string;
  let tokenRo: string;
  let tokenWrite: string;

  const user = generateUserFixture({
    email: "user@exemple.fr",
    is_admin: false,
  });

  const userRo = generateUserFixture({
    email: "userRo@exemple.fr",
    organisation: "ReadOnly",
    is_admin: false,
  });

  const userWrite = generateUserFixture({
    email: "userWrite@exemple.fr",
    organisation: "WriteOnly",
    is_admin: false,
  });

  const orgRo = generateOrganisationFixture({
    nom: "ReadOnly",
    slug: "read-only",
    habilitations: [],
  });

  const orgWrite = generateOrganisationFixture({
    nom: "WriteOnly",
    slug: "write-only",
    habilitations: ["jobs:write"],
  });

  const minimalBody: IJobOfferWritable = {
    offer: {
      title: "Opérations administratives",
      description: "Exécute des travaux administratifs courants",
    },
    workplace: {
      siret: "11000001500013",
    },
    apply: {},
  };

  const minimalLbaOffer: Pick<IJobOfferWritableLba, RequiredKeysOf<IJobOfferWritableLba>> = {
    offer_title: "Opérations administratives",
    offer_description: "Exécute des travaux administratifs courants",
    workplace_siret: "11000001500013",
  };

  beforeEach(async () => {
    await getDbCollection("users").insertMany([user, userRo, userWrite]);
    await getDbCollection("organisations").insertMany([orgRo, orgWrite]);
    token = (await generateApiKey("", user)).value;
    tokenRo = (await generateApiKey("", userRo)).value;
    tokenWrite = (await generateApiKey("", userWrite)).value;
  });

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/job/v1/offer",
      body: minimalBody,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource",
    });
  });

  it("should returns 401 if api key is invalid", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/job/v1/offer",
      body: minimalBody,
      headers: {
        Authorization: `Bearer ${token}invalid`,
      },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource",
    });
  });

  it("should returns 403 if user doesn't have organisation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/job/v1/offer",
      body: minimalBody,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      statusCode: 403,
      message: "Vous n'êtes pas autorisé à accéder à cette ressource",
      name: "Forbidden",
    });
  });

  it("should returns 403 if organisation doesn't have habilitation jobs:write", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/job/v1/offer",
      body: minimalBody,
      headers: {
        Authorization: `Bearer ${tokenRo}`,
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      statusCode: 403,
      message: "Vous n'êtes pas autorisé à accéder à cette ressource",
      name: "Forbidden",
    });
  });

  it("should support full model", async () => {
    const apiOffer: RequiredDeep<IJobOfferWritable> = {
      identifier: {
        partner_job_id: "1",
      },
      offer: {
        title: "Opérations administratives",
        description: "Exécute des travaux administratifs courants",
        rome_codes: ["M1602"],
        desired_skills: ["Faire preuve de rigueur et de précision"],
        to_be_acquired_skills: [
          "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
          "Production, Fabrication: Réaliser des travaux de reprographie",
          "Organisation: Contrôler la conformité des données ou des documents",
        ],
        target_diploma: {
          european: "4",
        },
        access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
        creation: new Date("2021-01-01T00:00:00.000Z"),
        expiration: new Date("2021-03-28T15:00:00.000Z"),
        opening_count: 1,
        multicast: true,
        origin: "La bonne alternance",
      },
      workplace: {
        siret: "11000001500013",
        name: "ASSEMBLEE NATIONALE",
        description: "Workplace Description",
        website: "https://assemblee-nationale.fr",
        address: { label: "Paris" },
      },
      apply: {
        url: "https://postler.com",
        phone: "0300000000",
        email: "mail@mail.com",
      },
      contract: {
        start: new Date("2021-01-28T15:00:00.000Z"),
        duration: 12,
        type: ["Apprentissage"],
        remote: "onsite",
      },
    };

    const expectedLbaOffer: Required<IJobOfferWritableLba> = {
      partner_job_id: "1",
      offer_title: "Opérations administratives",
      offer_description: "Exécute des travaux administratifs courants",
      offer_rome_codes: ["M1602"],
      offer_desired_skills: ["Faire preuve de rigueur et de précision"],
      offer_to_be_acquired_skills: [
        "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
        "Production, Fabrication: Réaliser des travaux de reprographie",
        "Organisation: Contrôler la conformité des données ou des documents",
      ],
      offer_target_diploma_european: "4",
      offer_access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
      offer_creation: new Date("2021-01-01T00:00:00.000Z"),
      offer_expiration: new Date("2021-03-28T15:00:00.000Z"),
      offer_opening_count: 1,
      offer_multicast: true,
      offer_origin: "La bonne alternance",
      workplace_siret: "11000001500013",
      workplace_name: "ASSEMBLEE NATIONALE",
      workplace_description: "Workplace Description",
      workplace_website: "https://assemblee-nationale.fr",
      workplace_address_label: "Paris",
      apply_url: "https://postler.com",
      apply_phone: "0300000000",
      apply_email: "mail@mail.com",
      contract_start: new Date("2021-01-28T15:00:00.000Z"),
      contract_duration: 12,
      contract_type: ["Apprentissage"],
      contract_remote: "onsite",
    };

    vi.mocked(createJobOfferLba).mockResolvedValue({ id: "1" });

    const response = await app.inject({
      method: "POST",
      url: `/api/job/v1/offer`,
      body: apiOffer,
      headers: {
        Authorization: `Bearer ${tokenWrite}`,
      },
    });

    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect(result).toEqual({ id: "1" });
    expect(createJobOfferLba).toHaveBeenCalledOnce();

    expect(createJobOfferLba).toHaveBeenCalledWith(
      expectedLbaOffer,
      expect.objectContaining({
        _id: userWrite._id,
        email: userWrite.email,
        organisation: userWrite.organisation,
      }),
      orgWrite
    );
  });

  it("should support minimal model", async () => {
    vi.mocked(createJobOfferLba).mockResolvedValue({ id: "1" });

    const response = await app.inject({
      method: "POST",
      url: `/api/job/v1/offer`,
      body: minimalBody,
      headers: {
        Authorization: `Bearer ${tokenWrite}`,
      },
    });

    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect(result).toEqual({ id: "1" });
    expect(createJobOfferLba).toHaveBeenCalledOnce();

    expect(createJobOfferLba).toHaveBeenCalledWith(
      minimalLbaOffer,
      expect.objectContaining({
        _id: userWrite._id,
        email: userWrite.email,
        organisation: userWrite.organisation,
      }),
      orgWrite
    );
  });

  it.each<[number, IResError, (messageOrError?: string | Error, data?: unknown) => Boom<unknown>]>([
    [
      400,
      {
        data: {
          validationError: {
            _errors: [],
            romes: {
              _errors: ["One or more ROME codes are invalid. Expected format is 'D1234'."],
            },
          },
        },
        message: "Request validation failed",
        name: "Bad Request",
        statusCode: 400,
      },
      badRequest,
    ],
    [
      403,
      {
        message: "You are not allowed to create a job offer",
        name: "Forbidden",
        statusCode: 403,
      },
      forbidden,
    ],
    [
      404,
      {
        message: "Resource not found",
        name: "Not Found",
        statusCode: 404,
      },
      notFound,
    ],
  ])("should throw back %s errors", async (statusCode, expectedError, errorBuilder) => {
    vi.mocked(createJobOfferLba).mockRejectedValue(errorBuilder(expectedError.message, expectedError.data));

    const response = await app.inject({
      method: "POST",
      url: `/api/job/v1/offer`,
      body: minimalBody,
      headers: {
        Authorization: `Bearer ${tokenWrite}`,
      },
    });

    expect.soft(response.statusCode).toBe(statusCode);
    const result = response.json();
    expect(result).toEqual(expectedError);
    expect(createJobOfferLba).toHaveBeenCalledOnce();

    expect(createJobOfferLba).toHaveBeenCalledWith(
      minimalLbaOffer,
      expect.objectContaining({
        _id: userWrite._id,
        email: userWrite.email,
        organisation: userWrite.organisation,
      }),
      orgWrite
    );
  });

  it("should throw back 500 without details", async () => {
    const expectedError: IResError = {
      message: "The server was unable to complete your request",
      name: "Internal Server Error",
      statusCode: 500,
    };

    const sensitiveData = {
      value: 42,
    };

    vi.mocked(createJobOfferLba).mockRejectedValue(internal("Some sensitive message", sensitiveData));

    const response = await app.inject({
      method: "POST",
      url: `/api/job/v1/offer`,
      body: minimalBody,
      headers: {
        Authorization: `Bearer ${tokenWrite}`,
      },
    });

    expect.soft(response.statusCode).toBe(500);
    const result = response.json();
    expect(result).toEqual(expectedError);
    expect(createJobOfferLba).toHaveBeenCalledOnce();

    expect(createJobOfferLba).toHaveBeenCalledWith(
      minimalLbaOffer,
      expect.objectContaining({
        _id: userWrite._id,
        email: userWrite.email,
        organisation: userWrite.organisation,
      }),
      orgWrite
    );
  });
});
