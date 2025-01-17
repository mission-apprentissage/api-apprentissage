import { useMongo } from "@tests/mongo.test.utils.js";
import { parseApiAlternanceToken } from "api-alternance-sdk";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { generateOrganisationFixture, generateUserFixture } from "shared/models/fixtures/index";
import type { IUser } from "shared/models/user.model";
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

const organisations = {
  jobWrite: generateOrganisationFixture({
    nom: "Org Job Write",
    slug: "org-job-write",
    habilitations: ["jobs:write"],
  }),
  applicationWrite: generateOrganisationFixture({
    nom: "Org Application Write",
    slug: "org-application-write",
    habilitations: ["applications:write"],
  }),
  read: generateOrganisationFixture({
    nom: "Org Read",
    slug: "org-read",
    habilitations: [],
  }),
  appointmentsWrite: generateOrganisationFixture({
    nom: "Org appointments Write",
    slug: "org-appointments-write",
    habilitations: ["appointments:write"],
  }),
};

const users = {
  basic: generateUserFixture({
    email: "basic@exemple.fr",
    is_admin: false,
    organisation: null,
  }),
  read: generateUserFixture({
    email: "ro@exemple.fr",
    is_admin: false,
    organisation: organisations.read.nom,
  }),
  jobWrite: generateUserFixture({
    email: "job-write@exemple.fr",
    is_admin: false,
    organisation: organisations.jobWrite.nom,
  }),
  applicationWrite: generateUserFixture({
    email: "application-write@exemple.fr",
    is_admin: false,
    organisation: organisations.applicationWrite.nom,
  }),
  appointmentsWrite: generateUserFixture({
    email: "appointments-write@exemple.fr",
    is_admin: false,
    organisation: organisations.appointmentsWrite.nom,
  }),
};

const tokens = {
  basic: "",
  read: "",
  jobWrite: "",
  applicationWrite: "",
  appointmentsWrite: "",
};

const nockMatchUserAuthorization = (u: IUser, habilitations: string[]) => (token: string) => {
  expect
    .soft(
      parseApiAlternanceToken({
        token,
        publicKey: config.api.alternance.public_cert,
      })
    )
    .toEqual({
      data: {
        email: u.email,
        habilitations: habilitations.reduce((acc, h) => ({ ...acc, [h]: true }), {
          "applications:write": false,
          "appointments:write": false,
          "jobs:write": false,
        }),
        organisation: u.organisation,
      },
      success: true,
    });
  return true;
};

beforeEach(async () => {
  await getDbCollection("users").insertMany(Object.values(users));
  await getDbCollection("organisations").insertMany(Object.values(organisations));
  tokens.basic = (await generateApiKey("", users.basic)).value;
  tokens.read = (await generateApiKey("", users.read)).value;
  tokens.jobWrite = (await generateApiKey("", users.jobWrite)).value;
  tokens.applicationWrite = (await generateApiKey("", users.applicationWrite)).value;
  tokens.appointmentsWrite = (await generateApiKey("", users.appointmentsWrite)).value;
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
        Authorization: `Bearer ${tokens.basic}invalid`,
      },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Impossible de déchiffrer la clé d'API",
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
      .matchHeader("authorization", nockMatchUserAuthorization(users.basic, []))
      .reply(200, data);

    const response = await app.inject({
      method: "GET",
      url: `/api/job/v1/search?longitude=-4.6&latitude=42.85&radius=60&target_diploma_level=3&romes=I1401,I1306&rncp=RNCP38654`,
      headers: {
        Authorization: `Bearer ${tokens.basic}`,
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
        Authorization: `Bearer ${tokens.basic}invalid`,
      },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Impossible de déchiffrer la clé d'API",
    });
  });

  it("should returns 403 if user doesn't have organisation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/job/v1/offer",
      body: body,
      headers: {
        Authorization: `Bearer ${tokens.basic}`,
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      statusCode: 403,
      message: "Vous n'êtes pas autorisé à accéder à cette ressource",
      name: "Forbidden",
    });
  });

  it.each<[keyof typeof tokens]>([["read"], ["applicationWrite"], ["appointmentsWrite"]])(
    "should returns 403 if organisation doesn't have habilitation jobs:write (%s)",
    async (name) => {
      const response = await app.inject({
        method: "POST",
        url: "/api/job/v1/offer",
        body: body,
        headers: {
          Authorization: `Bearer ${tokens[name]}`,
        },
      });
      expect.soft(response.statusCode).toBe(403);
      expect(response.json()).toEqual({
        statusCode: 403,
        message: "Vous n'êtes pas autorisé à accéder à cette ressource",
        name: "Forbidden",
      });
    }
  );

  it("should support valid request", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v3/jobs", (b) => {
        expect.soft(b).toEqual(body);
        return true;
      })
      .matchHeader("authorization", nockMatchUserAuthorization(users.jobWrite, ["jobs:write"]))
      .reply(200, { id: "1" });

    const response = await app.inject({
      method: "POST",
      url: `/api/job/v1/offer`,
      body,
      headers: {
        Authorization: `Bearer ${tokens.jobWrite}`,
      },
    });

    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect(result).toEqual({ id: "1" });
  });
});

describe("POST /job/v1/apply", () => {
  const applicationTestFile = "data:application/pdf;base64,";

  const body = {
    applicant_attachment_name: "cv.pdf",
    applicant_attachment_content: applicationTestFile,
    applicant_email: "jeam.dupont@mail.com",
    applicant_first_name: "Jean",
    applicant_last_name: "Dupont",
    applicant_phone: "0101010101",
    recipient_id: "2093",
  };

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/job/v1/apply",
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
      url: "/api/job/v1/apply",
      body: body,
      headers: {
        Authorization: `Bearer ${tokens.basic}invalid`,
      },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Impossible de déchiffrer la clé d'API",
    });
  });

  it("should returns 403 if user doesn't have organisation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/job/v1/apply",
      body: body,
      headers: {
        Authorization: `Bearer ${tokens.basic}`,
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      statusCode: 403,
      message: "Vous n'êtes pas autorisé à accéder à cette ressource",
      name: "Forbidden",
    });
  });

  it.each<[keyof typeof tokens]>([["read"], ["jobWrite"]])(
    "should returns 403 if organisation doesn't have habilitation applications:write",
    async (name) => {
      const response = await app.inject({
        method: "POST",
        url: "/api/job/v1/apply",
        body: body,
        headers: {
          Authorization: `Bearer ${tokens[name]}`,
        },
      });
      expect(response.statusCode).toBe(403);
      expect(response.json()).toEqual({
        statusCode: 403,
        message: "Vous n'êtes pas autorisé à accéder à cette ressource",
        name: "Forbidden",
      });
    }
  );

  it("should support valid request", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/application", (b) => {
        expect.soft(b).toEqual(body);
        return true;
      })
      .matchHeader("authorization", nockMatchUserAuthorization(users.applicationWrite, ["applications:write"]))
      .reply(200, { id: "1" });

    const response = await app.inject({
      method: "POST",
      url: `/api/job/v1/apply`,
      body,
      headers: {
        Authorization: `Bearer ${tokens.applicationWrite}`,
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
        Authorization: `Bearer ${tokens.basic}invalid`,
      },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Impossible de déchiffrer la clé d'API",
    });
  });

  it("should returns 403 if user doesn't have organisation", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/job/v1/offer/42",
      body: body,
      headers: {
        Authorization: `Bearer ${tokens.basic}`,
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      statusCode: 403,
      message: "Vous n'êtes pas autorisé à accéder à cette ressource",
      name: "Forbidden",
    });
  });

  it.each<[keyof typeof tokens]>([["read"], ["applicationWrite"]])(
    "should returns 403 if organisation doesn't have habilitation jobs:write",
    async (name) => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/job/v1/offer/42",
        body: body,
        headers: {
          Authorization: `Bearer ${tokens[name]}`,
        },
      });
      expect.soft(response.statusCode).toBe(403);
      expect.soft(response.json()).toEqual({
        statusCode: 403,
        message: "Vous n'êtes pas autorisé à accéder à cette ressource",
        name: "Forbidden",
      });
    }
  );

  it("should support valid request", async () => {
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .put("/v3/jobs/42", (b) => {
        expect.soft(b).toEqual(body);
        return true;
      })
      .matchHeader("authorization", nockMatchUserAuthorization(users.jobWrite, ["jobs:write"]))
      .reply(204);

    const response = await app.inject({
      method: "PUT",
      url: `/api/job/v1/offer/42`,
      body,
      headers: {
        Authorization: `Bearer ${tokens.jobWrite}`,
      },
    });

    expect.soft(response.statusCode).toBe(204);
    expect(response.body).toEqual("");
  });
});
