import { useMongo } from "@tests/mongo.test.utils.js";
import {
  generateOrganismeReferentielFixture,
  generateSourceReferentiel,
  generateUserFixture,
} from "shared/models/fixtures/index";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { generateApiKey } from "@/actions/users.actions.js";
import createServer, { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

useMongo();

describe("GET /api/organisme/v1/recherche", () => {
  let app: Server;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    return () => app.close();
  }, 15_000);

  const uai1 = "0491801S";
  const uai2 = "0594899E";
  const uai3 = "0631408N";

  const siret1 = "19850144700025";
  const siret2 = "26590673500120";

  let token: string;

  beforeEach(async () => {
    const user = generateUserFixture({
      email: "user@exemple.fr",
      is_admin: false,
    });
    await getDbCollection("users").insertOne(user);
    token = (await generateApiKey("", user)).value;
    await getDbCollection("source.referentiel").insertMany([
      generateSourceReferentiel({
        data: generateOrganismeReferentielFixture({
          uai: uai1,
          siret: siret1,
          etat_administratif: "actif",
        }),
      }),
      generateSourceReferentiel({
        data: generateOrganismeReferentielFixture({
          uai: uai2,
          siret: siret2,
          etat_administratif: "fermé",
          lieux_de_formation: [{ uai: uai3 }],
        }),
      }),
    ]);
  });

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/organisme/v1/recherche",
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
      url: "/api/organisme/v1/recherche",
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

  it.each([
    [
      "",
      {
        candidats: [],
        metadata: {
          siret: null,
          uai: null,
        },
        resultat: null,
      },
    ],
    [
      `?siret=${siret1}`,
      {
        candidats: [],
        metadata: {
          siret: { status: "ok" },
          uai: null,
        },
        resultat: {
          correspondances: {
            siret: {
              lui_meme: true,
              son_formateur: false,
              son_responsable: false,
            },
            uai: null,
          },
          organisme: {
            identifiant: {
              siret: "19850144700025",
              uai: "0491801S",
            },
          },
          status: {
            declaration_catalogue: true,
            ouvert: true,
            validation_uai: true,
          },
        },
      },
    ],
    [
      `?uai=${uai2}`,
      {
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
      },
    ],
    [
      `?uai=${uai3}&siret=${siret2}`,
      {
        candidats: [],
        metadata: {
          siret: { status: "fermé" },
          uai: { status: "ok" },
        },
        resultat: {
          correspondances: {
            siret: {
              lui_meme: true,
              son_formateur: false,
              son_responsable: false,
            },
            uai: {
              lui_meme: false,
              son_lieu: true,
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
      },
    ],
  ])('should perform search "%s" correctly', async (search, expected) => {
    const response = await app.inject({
      method: "GET",
      url: `/api/organisme/v1/recherche${search}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect.soft(result).toEqual(expected);
  });
});
