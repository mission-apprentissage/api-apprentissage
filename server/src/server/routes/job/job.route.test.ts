import { useMongo } from "@tests/mongo.test.utils.js";
import { parseApiAlternanceToken } from "api-alternance-sdk";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { generateOrganisationFixture, generateUserFixture } from "shared/models/fixtures/index";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { generateApiKey } from "@/actions/users.actions.js";
import config from "@/config.js";
import type { Server } from "@/server/server.js";
import createServer from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

useMongo();

beforeEach(() => {
  disableNetConnect();

  return () => {
    cleanAll();
    enableNetConnect();
  };
});

let app: Server;

beforeAll(async () => {
  app = await createServer();
  await app.ready();

  return () => app.close();
}, 15_000);

let basicToken: string;
let orgWriteToken: string;
let orgReadToken: string;

const basicUser = generateUserFixture({
  email: "basic@exemple.fr",
  is_admin: false,
  organisation: null,
});

const orgWrite = generateOrganisationFixture({
  nom: "Org",
  slug: "org",
  habilitations: ["jobs:write"],
});

const orgWriteUser = generateUserFixture({
  email: "user@exemple.fr",
  is_admin: false,
  organisation: orgWrite.nom,
});

const orgRead = generateOrganisationFixture({
  nom: "Org Read",
  slug: "org-read",
  habilitations: [],
});

const orgReadUser = generateUserFixture({
  email: "ro@exemple.fr",
  is_admin: false,
  organisation: orgRead.nom,
});

const nockMatchBasicUserAuthorization = (token: string) => {
  expect
    .soft(
      parseApiAlternanceToken({
        token,
        publicKey: config.api.alternance.public_cert,
      })
    )
    .toEqual({
      data: {
        email: "basic@exemple.fr",
        habilitations: {
          "applications:write": false,
          "appointments:write": false,
          "jobs:write": false,
        },
        organisation: null,
      },
      success: true,
    });
  return true;
};

const nockMatchOrgWriteUserAuthorization = (token: string) => {
  expect
    .soft(
      parseApiAlternanceToken({
        token,
        publicKey: config.api.alternance.public_cert,
      })
    )
    .toEqual({
      data: {
        email: "user@exemple.fr",
        habilitations: {
          "applications:write": false,
          "appointments:write": false,
          "jobs:write": true,
        },
        organisation: "Org",
      },
      success: true,
    });
  return true;
};

beforeEach(async () => {
  await getDbCollection("users").insertMany([basicUser, orgReadUser, orgWriteUser]);
  await getDbCollection("organisations").insertMany([orgWrite, orgRead]);
  basicToken = (await generateApiKey("", basicUser)).value;
  orgWriteToken = (await generateApiKey("", orgWriteUser)).value;
  orgReadToken = (await generateApiKey("", orgReadUser)).value;
});

describe("GET /job/v1/search", () => {
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
        Authorization: `Bearer ${basicToken}invalid`,
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
    const data = {
      jobs: [
        {
          identifier: {
            id: "1",
            partner_label: "La bonne alternance",
            partner_job_id: null,
          },
        },
      ],
      recruiters: [
        {
          identifier: {
            id: "42",
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

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .get("/v3/jobs/search")
      .query({
        longitude: -4.6,
        latitude: 42.85,
        radius: 60,
        target_diploma_level: "3",
        romes: "I1401,I1306",
        rncp: "RNCP38654",
      })
      .matchHeader("authorization", nockMatchBasicUserAuthorization)
      .reply(200, data);

    const response = await app.inject({
      method: "GET",
      url: `/api/job/v1/search?longitude=-4.6&latitude=42.85&radius=60&target_diploma_level=3&romes=I1401,I1306&rncp=RNCP38654`,
      headers: {
        Authorization: `Bearer ${basicToken}`,
      },
    });

    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect(result).toEqual(data);
  });
});

describe("POST /job/v1/offer", () => {
  const body = {
    offer: {
      title: "Opérations administratives",
      description: "Exécute des travaux administratifs courants",
    },
    workplace: {
      siret: "11000001500013",
    },
    apply: {},
  };

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/job/v1/offer",
      body: body,
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
      body: body,
      headers: {
        Authorization: `Bearer ${basicToken}invalid`,
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
      body: body,
      headers: {
        Authorization: `Bearer ${basicToken}`,
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
      body: body,
      headers: {
        Authorization: `Bearer ${orgReadToken}`,
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      statusCode: 403,
      message: "Vous n'êtes pas autorisé à accéder à cette ressource",
      name: "Forbidden",
    });
  });

  it("should support valid request", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v3/jobs", (b) => {
        expect.soft(b).toEqual(body);
        return true;
      })
      .matchHeader("authorization", nockMatchOrgWriteUserAuthorization)
      .reply(200, { id: "1" });

    const response = await app.inject({
      method: "POST",
      url: `/api/job/v1/offer`,
      body,
      headers: {
        Authorization: `Bearer ${orgWriteToken}`,
      },
    });

    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect(result).toEqual({ id: "1" });
  });
});

describe("PUT /job/v1/offer/:id", () => {
  const body = {
    offer: {
      title: "Opérations administratives",
      description: "Exécute des travaux administratifs courants",
    },
    workplace: {
      siret: "11000001500013",
    },
    apply: {},
  };

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/job/v1/offer/42",
      body: body,
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
      method: "PUT",
      url: "/api/job/v1/offer/42",
      body: body,
      headers: {
        Authorization: `Bearer ${basicToken}invalid`,
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
      method: "PUT",
      url: "/api/job/v1/offer/42",
      body: body,
      headers: {
        Authorization: `Bearer ${basicToken}`,
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
      method: "PUT",
      url: "/api/job/v1/offer/42",
      body: body,
      headers: {
        Authorization: `Bearer ${orgReadToken}`,
      },
    });
    expect.soft(response.statusCode).toBe(403);
    expect.soft(response.json()).toEqual({
      statusCode: 403,
      message: "Vous n'êtes pas autorisé à accéder à cette ressource",
      name: "Forbidden",
    });
  });

  it("should support valid request", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .put("/v3/jobs/42", (b) => {
        expect.soft(b).toEqual(body);
        return true;
      })
      .matchHeader("authorization", nockMatchOrgWriteUserAuthorization)
      .reply(204);

    const response = await app.inject({
      method: "PUT",
      url: `/api/job/v1/offer/42`,
      body,
      headers: {
        Authorization: `Bearer ${orgWriteToken}`,
      },
    });

    expect.soft(response.statusCode).toBe(204);
    expect(response.body).toEqual("");
  });
});
