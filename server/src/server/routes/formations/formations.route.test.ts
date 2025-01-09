import { useMongo } from "@tests/mongo.test.utils.js";
import { parseApiAlternanceToken } from "api-alternance-sdk";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { generateFormationFixture, generateUserFixture, sourceCommuneFixtures } from "shared/models/fixtures/index";
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

let token: string;
const user = generateUserFixture({
  email: "user@exemple.fr",
  is_admin: false,
});

beforeEach(async () => {
  await getDbCollection("users").insertOne(user);
  token = (await generateApiKey("", user)).value;
});

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
    generateFormationFixture({
      identifiant: { cle_ministere_educatif: "paris" },
      lieu: {
        geolocalisation: sourceCommuneFixtures["75"][0].centre,
      },
    }),
    generateFormationFixture({
      identifiant: { cle_ministere_educatif: "clichy" },
      lieu: {
        geolocalisation: {
          type: "Point",
          coordinates: [clichy.longitude, clichy.latitude],
        },
      },
    }),
    generateFormationFixture({
      identifiant: { cle_ministere_educatif: "levallois" },
      lieu: {
        geolocalisation: {
          type: "Point",
          coordinates: [levallois.longitude, levallois.latitude],
        },
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
        Authorization: `Bearer ${token}invalid`,
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
        Authorization: `Bearer ${token}`,
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
    expect
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .soft(result.data.map((r: any) => r.identifiant))
      .toEqual([formations[1].identifiant, formations[2].identifiant, formations[0].identifiant]);
    expect(result.data[0]).toMatchSnapshot();
  });
});

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

describe("POST /formation/v1/appointment/generate-link", () => {
  const body = { cle_ministere_educatif: "088281P01313885594860007038855948600070-67118#L01" };

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/formation/v1/appointment/generate-link",
      body,
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
      headers: { Authorization: `Bearer ${token}invalid` },
      url: "/api/formation/v1/appointment/generate-link",
      body,
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Impossible de déchiffrer la clé d'API",
    });
  });

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

    nock("https://labonnealternance-recette.apprentissage.beta.gouv.fr/api")
      .post("/v2/appointment", (b) => {
        expect.soft(b).toEqual(body);
        return true;
      })
      .matchHeader("authorization", nockMatchUserAuthorization(user, []))
      .reply(200, data);

    const response = await app.inject({
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      url: "/api/formation/v1/appointment/generate-link",
      body,
    });

    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect(result).toEqual(data);
  });
});
