import { parseApiAlternanceToken, zFormation } from "api-alternance-sdk";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import {
  generateFormationInternalFixture,
  generateOrganisationFixture,
  generateUserFixture,
  sourceCommuneFixtures,
} from "shared/models/fixtures/index";
import type { IUser } from "shared/models/user.model";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { useMongo } from "@tests/mongo.test.utils.js";

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

describe("GET /formation/v1/search", () => {
  const clichy = {
    longitude: 2.3041,
    latitude: 48.9041,
  };

  const levallois = {
    longitude: 2.2874,
    latitude: 48.8946,
  };

  const formations = [
    generateFormationInternalFixture({
      identifiant: { cle_ministere_educatif: "paris" },
      lieu: {
        geolocalisation: sourceCommuneFixtures["75"][0].centre,
      },
    }),
    generateFormationInternalFixture({
      identifiant: { cle_ministere_educatif: "clichy" },
      lieu: {
        geolocalisation: {
          type: "Point",
          coordinates: [clichy.longitude, clichy.latitude],
        },
      },
    }),
    generateFormationInternalFixture({
      identifiant: { cle_ministere_educatif: "levallois" },
      lieu: {
        geolocalisation: {
          type: "Point",
          coordinates: [levallois.longitude, levallois.latitude],
        },
      },
    }),
    generateFormationInternalFixture({
      identifiant: { cle_ministere_educatif: "archived" },
      lieu: {
        geolocalisation: {
          type: "Point",
          coordinates: [levallois.longitude, levallois.latitude],
        },
      },
      statut: {
        catalogue: "archivé",
      },
    }),
  ];

  beforeEach(async () => {
    await getDbCollection("formation").insertMany(formations);
  });

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/formation/v1/search",
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
      url: "/api/formation/v1/search",
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

  it("should perform search correctly", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/formation/v1/search?latitude=${clichy.latitude}&longitude=${clichy.longitude}&radius=30`,
      headers: {
        Authorization: `Bearer ${tokens.basic}`,
      },
    });
    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect.soft(result.pagination).toEqual({
      page_count: 1,
      page_size: 100,
      page_index: 0,
    });
    expect.soft(result.data).toHaveLength(3);
    expect
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .soft(result.data.map((r: any) => r.identifiant))
      .toEqual([formations[1].identifiant, formations[2].identifiant, formations[0].identifiant]);
    expect(result.data[0]).toMatchSnapshot();
  });

  it("should support include_archived param", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/formation/v1/search?include_archived=true`,
      headers: {
        Authorization: `Bearer ${tokens.basic}`,
      },
    });
    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect.soft(result.pagination).toEqual({
      page_count: 1,
      page_size: 100,
      page_index: 0,
    });
    expect.soft(result.data).toHaveLength(formations.length);
  });

  it("should support include_archived param", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/formation/v1/search?include_archived=false`,
      headers: {
        Authorization: `Bearer ${tokens.basic}`,
      },
    });
    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect.soft(result.pagination).toEqual({
      page_count: 1,
      page_size: 100,
      page_index: 0,
    });
    expect.soft(result.data).toHaveLength(3);
  });
});

const nockMatchUserAuthorization = (u: IUser, habilitations: string[]) => {
  let token: string = "";

  return {
    matchHeader: (t: string) => {
      token = t;
      return true;
    },
    expectAuth: async () => {
      return expect
        .soft(
          parseApiAlternanceToken({
            token,
            publicKey: config.api.alternance.public_cert,
          })
        )
        .resolves.toEqual({
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
    },
  };
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

describe("POST /formation/v1/appointment/generate-link", () => {
  const body = { cle_ministere_educatif: "088281P01313885594860007038855948600070-67118#L01" };

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/formation/v1/appointment/generate-link",
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
      url: "/api/formation/v1/appointment/generate-link",
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
      url: "/api/formation/v1/appointment/generate-link",
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

  it.each<[keyof typeof tokens]>([["read"], ["applicationWrite"], ["jobWrite"]])(
    "should returns 403 if organisation doesn't have habilitation appointment:write (%s)",
    async (name) => {
      const response = await app.inject({
        method: "POST",
        url: "/api/formation/v1/appointment/generate-link",
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

  it("should return result from lba", async () => {
    const data = {
      cfd: "32025001",
      cle_ministere_educatif: "088281P01313885594860007038855948600070-67118#L01",
      code_postal: "93290",
      etablissement_formateur_entreprise_raison_sociale: "AFORP FORMATION",
      etablissement_formateur_siret: "77572845400205",
      form_url:
        "https://labonnealternance.apprentissage.beta.gouv.fr/formation/rdv/088281P01313885594860007038855948600070-67118#L01",
      intitule_long: "ASSISTANCE TECHNIQUE D'INGENIEUR (BTS)",
      lieu_formation_adresse: "64 Avenue de la Plaine de France",
      localite: "Tremblay-en-France",
    };

    const { matchHeader, expectAuth } = nockMatchUserAuthorization(users.appointmentsWrite, ["appointments:write"]);
    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/appointment", (b) => {
        expect.soft(b).toEqual(body);
        return true;
      })
      .matchHeader("authorization", matchHeader)
      .reply(200, data);

    const response = await app.inject({
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.appointmentsWrite}` },
      url: "/api/formation/v1/appointment/generate-link",
      body,
    });

    await expectAuth();
    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect(result).toEqual(data);
  });
});

describe("GET /formation/v1/:id", () => {
  beforeEach(async () => {
    await getDbCollection("formation").deleteMany({});
  });

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/formation/v1/23",
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
      url: "/api/formation/v1/23",
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

  it("should return 404 if formation id does not exist", async () => {
    const invalidId = "paris"; // ou un autre ID qui ne sera pas trouvé
    const response = await app.inject({
      method: "GET",
      url: `/api/formation/v1/${invalidId}`,
      headers: {
        Authorization: `Bearer ${tokens.basic}`,
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      statusCode: 404,
      name: "Not Found",
      message: `Aucune formation trouvée pour l'identifiant ${invalidId}`,
    });
  });

  it("should return formation by id", async () => {
    const validId = "cle-me-test";

    const formation = generateFormationInternalFixture({
      identifiant: { cle_ministere_educatif: validId },
      lieu: {
        geolocalisation: {
          type: "Point",
          coordinates: [2.2874, 48.8946],
        },
      },
    });
    await getDbCollection("formation").insertOne(formation);

    const response = await app.inject({
      method: "GET",
      url: `/api/formation/v1/${validId}`,
      headers: {
        Authorization: `Bearer ${tokens.basic}`,
      },
    });

    expect(response.statusCode).toBe(200);

    const result = response.json();

    expect(() => zFormation.parse(result)).not.toThrow();
    expect(result.identifiant.cle_ministere_educatif).toBe(validId);
    expect(result).toMatchSnapshot();
  });
});
