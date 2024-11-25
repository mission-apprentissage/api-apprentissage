import { useMongo } from "@tests/mongo.test.utils.js";
import { communeFixtures, generateUserFixture, sourceDepartementFixtures } from "shared/models/fixtures/index";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { generateApiKey } from "@/actions/users.actions.js";
import type { Server } from "@/server/server.js";
import createServer from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

useMongo();

describe("GET /geographie/v1/commune/search", () => {
  let app: Server;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    return () => app.close();
  }, 15_000);

  let token: string;

  beforeEach(async () => {
    const user = generateUserFixture({
      email: "user@exemple.fr",
      is_admin: false,
    });
    await getDbCollection("users").insertOne(user);
    token = (await generateApiKey("", user)).value;
    await getDbCollection("commune").insertMany(communeFixtures);
  });

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/geographie/v1/commune/search?code=00000",
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
      url: "/api/geographie/v1/commune/search?code=00000",
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

  it.each([
    ["?code=75056", communeFixtures.filter((c) => c.code.insee === "75056")],
    ["?code=75003", communeFixtures.filter((c) => c.code.postaux.includes("75003"))],
  ])('should perform search "%s" correctly', async (search, expected) => {
    const response = await app.inject({
      method: "GET",
      url: `/api/geographie/v1/commune/search${search}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect.soft(result).toHaveLength(expected.length);
    expect
      .soft(result)
      .toEqual(expect.arrayContaining(expected.map(({ _id, created_at, updated_at, ...rest }) => rest)));
  });
});

describe("GET /geographie/v1/departement", () => {
  let app: Server;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    return () => app.close();
  }, 15_000);

  let token: string;

  beforeEach(async () => {
    const user = generateUserFixture({
      email: "user@exemple.fr",
      is_admin: false,
    });
    await getDbCollection("users").insertOne(user);
    token = (await generateApiKey("", user)).value;
    await getDbCollection("commune").insertMany(communeFixtures);
  });

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/geographie/v1/departement",
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
      url: "/api/geographie/v1/departement",
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

  it("should retrive all departements", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/geographie/v1/departement`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect
      .soft(result)
      .toHaveLength(Object.values(sourceDepartementFixtures).reduce((acc, curr) => acc + curr.length, 0));
    expect.soft(result).toEqual([
      {
        codeInsee: "18",
        nom: "Cher",
        region: {
          codeInsee: "24",
          nom: "Centre-Val de Loire",
        },
        academie: {
          code: "18",
          id: "A18",
          nom: "Orléans-Tours",
        },
      },
      {
        codeInsee: "41",
        nom: "Loir-et-Cher",
        region: {
          codeInsee: "24",
          nom: "Centre-Val de Loire",
        },
        academie: {
          code: "18",
          id: "A18",
          nom: "Orléans-Tours",
        },
      },
      {
        codeInsee: "45",
        nom: "Loiret",
        region: {
          codeInsee: "24",
          nom: "Centre-Val de Loire",
        },
        academie: {
          code: "18",
          id: "A18",
          nom: "Orléans-Tours",
        },
      },
      {
        codeInsee: "75",
        nom: "Paris",
        region: {
          codeInsee: "11",
          nom: "Île-de-France",
        },
        academie: {
          code: "01",
          id: "A01",
          nom: "Paris",
        },
      },
      {
        codeInsee: "77",
        nom: "Seine-et-Marne",
        region: {
          codeInsee: "11",
          nom: "Île-de-France",
        },
        academie: {
          code: "24",
          id: "A24",
          nom: "Créteil",
        },
      },
      {
        codeInsee: "975",
        nom: "Saint-Pierre-et-Miquelon",
        region: {
          codeInsee: "975",
          nom: "Saint-Pierre-et-Miquelon",
        },
        academie: {
          code: "44",
          id: "A44",
          nom: "Saint-Pierre-et-Miquelon",
        },
      },
      {
        academie: {
          code: "41",
          id: "A41",
          nom: "Polynésie Française",
        },
        codeInsee: "989",
        nom: "Île de Clipperton",
        region: {
          codeInsee: "989",
          nom: "La Passion-Clipperton",
        },
      },
    ]);
  });
});
