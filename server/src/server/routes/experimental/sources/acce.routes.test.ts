import { useMongo } from "@tests/mongo.test.utils";
import { ObjectId } from "mongodb";
import {
  generateSourceAcceFilleFixture,
  generateSourceAcceMereFixture,
  generateSourceAcceSpecFixture,
  generateSourceAcceUaiFixture,
  generateSourceAcceZoneFixture,
  generateUserFixture,
} from "shared/models/fixtures";
import {
  ISourceAcceUai,
  ISourceAcceUaiFille,
  ISourceAcceUaiMere,
  ISourceAcceUaiSpec,
  ISourceAcceUaiZone,
} from "shared/models/source/acce/source.acce.model";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { generateApiKey } from "@/actions/users.actions";
import createServer, { Server } from "@/server/server";
import { getDbCollection } from "@/services/mongodb/mongodbService";

useMongo();

let app: Server;
let token: string;
const importDate = new Date("2024-03-07T00:00:00Z");

const todayImport = {
  acce: {
    "0021518P": generateSourceAcceUaiFixture({
      data: {
        numero_uai: "0021518P",
      },
      date: importDate,
    }),
    "0022210S": generateSourceAcceUaiFixture({
      data: {
        numero_uai: "0022210S",
      },
      date: importDate,
    }),
    "0010001W": generateSourceAcceUaiFixture({
      data: {
        numero_uai: "0010001W",
      },
      date: importDate,
    }),
    "0100112T": generateSourceAcceUaiFixture({
      data: {
        numero_uai: "0100112T",
      },
      date: importDate,
    }),
    "0601748Z": generateSourceAcceUaiFixture({
      data: {
        numero_uai: "0601748Z",
      },
      date: importDate,
    }),
  },
  zone: {
    "0021518P": generateSourceAcceZoneFixture({
      data: {
        numero_uai: "0021518P",
      },
      date: importDate,
    }),
    "0022210S": generateSourceAcceZoneFixture({
      data: {
        numero_uai: "0022210S",
      },
      date: importDate,
    }),
    "0010001W": generateSourceAcceZoneFixture({
      data: {
        numero_uai: "0010001W",
      },
      date: importDate,
    }),
    "0100112T": generateSourceAcceZoneFixture({
      data: {
        numero_uai: "0100112T",
      },
      date: importDate,
    }),
    "0601748Z": generateSourceAcceZoneFixture({
      data: {
        numero_uai: "0601748Z",
      },
      date: importDate,
    }),
  },
  spec: {
    "0021518P": generateSourceAcceSpecFixture({
      data: {
        numero_uai: "0021518P",
      },
      date: importDate,
    }),
    "0022210S": generateSourceAcceSpecFixture({
      data: {
        numero_uai: "0022210S",
      },
      date: importDate,
    }),
    "0010001W": generateSourceAcceSpecFixture({
      data: {
        numero_uai: "0010001W",
      },
      date: importDate,
    }),
    "0100112T": generateSourceAcceSpecFixture({
      data: {
        numero_uai: "0100112T",
      },
      date: importDate,
    }),
    "0601748Z": generateSourceAcceSpecFixture({
      data: {
        numero_uai: "0601748Z",
      },
      date: importDate,
    }),
  },
  mere: {
    "0021518P": generateSourceAcceMereFixture({
      data: {
        numero_uai_trouve: "0021518P",
      },
      date: importDate,
    }),
    "0022210S": generateSourceAcceMereFixture({
      data: {
        numero_uai_trouve: "0022210S",
      },
      date: importDate,
    }),
    "0010001W": generateSourceAcceMereFixture({
      data: {
        numero_uai_trouve: "0010001W",
      },
      date: importDate,
    }),
    "0100112T": generateSourceAcceMereFixture({
      data: {
        numero_uai_trouve: "0100112T",
      },
      date: importDate,
    }),
    "0601748Z": generateSourceAcceMereFixture({
      data: {
        numero_uai_trouve: "0601748Z",
      },
      date: importDate,
    }),
  },
  fille: {
    "0021518P": generateSourceAcceFilleFixture({
      data: {
        numero_uai_trouve: "0021518P",
      },
      date: importDate,
    }),
    "0022210S": generateSourceAcceFilleFixture({
      data: {
        numero_uai_trouve: "0022210S",
      },
      date: importDate,
    }),
    "0010001W": generateSourceAcceFilleFixture({
      data: {
        numero_uai_trouve: "0010001W",
      },
      date: importDate,
    }),
    "0100112T": generateSourceAcceFilleFixture({
      data: {
        numero_uai_trouve: "0100112T",
      },
      date: importDate,
    }),
    "0601748Z": generateSourceAcceFilleFixture({
      data: {
        numero_uai_trouve: "0601748Z",
      },
      date: importDate,
    }),
  },
} as const satisfies {
  acce: Record<string, ISourceAcceUai>;
  zone: Record<string, ISourceAcceUaiZone>;
  spec: Record<string, ISourceAcceUaiSpec>;
  mere: Record<string, ISourceAcceUaiMere>;
  fille: Record<string, ISourceAcceUaiFille>;
};

const yesterdayImport = {
  acce: {
    "0021518P": generateSourceAcceUaiFixture({
      data: {
        numero_uai: "0021518P",
      },
      date: new Date("2024-03-06T00:00:00Z"),
    }),
  },
  zone: {
    "0022210S": generateSourceAcceZoneFixture({
      data: {
        numero_uai: "0022210S",
      },
      date: new Date("2024-03-06T00:00:00Z"),
    }),
  },
  spec: {
    "0601748Z": generateSourceAcceSpecFixture({
      data: {
        numero_uai: "0601748Z",
      },
      date: new Date("2024-03-06T00:00:00Z"),
    }),
  },
  mere: {
    "0100112T": generateSourceAcceMereFixture({
      data: {
        numero_uai_trouve: "0100112T",
      },
      date: new Date("2024-03-06T00:00:00Z"),
    }),
  },
  fille: {
    "0010001W": generateSourceAcceFilleFixture({
      data: {
        numero_uai_trouve: "0010001W",
      },
      date: new Date("2024-03-06T00:00:00Z"),
    }),
  },
} as const satisfies {
  acce: Record<string, ISourceAcceUai>;
  zone: Record<string, ISourceAcceUaiZone>;
  spec: Record<string, ISourceAcceUaiSpec>;
  mere: Record<string, ISourceAcceUaiMere>;
  fille: Record<string, ISourceAcceUaiFille>;
};

beforeAll(async () => {
  app = await createServer();
  await app.ready();

  return () => app.close();
}, 15_000);

describe("acce.routes", () => {
  beforeEach(async () => {
    const user = generateUserFixture({
      email: "user@exemple.fr",
      is_admin: false,
    });
    await getDbCollection("users").insertOne(user);
    token = (await generateApiKey("", user)).value;
    await getDbCollection("source.acce").insertMany(Object.values(todayImport.acce));
    await getDbCollection("source.acce").insertMany(Object.values(yesterdayImport.acce));
    await getDbCollection("source.acce").insertMany(Object.values(todayImport.zone));
    await getDbCollection("source.acce").insertMany(Object.values(yesterdayImport.zone));
    await getDbCollection("source.acce").insertMany(Object.values(todayImport.spec));
    await getDbCollection("source.acce").insertMany(Object.values(yesterdayImport.spec));
    await getDbCollection("source.acce").insertMany(Object.values(todayImport.mere));
    await getDbCollection("source.acce").insertMany(Object.values(yesterdayImport.mere));
    await getDbCollection("source.acce").insertMany(Object.values(todayImport.fille));
    await getDbCollection("source.acce").insertMany(Object.values(yesterdayImport.fille));
    await getDbCollection("import.meta").insertOne({
      _id: new ObjectId(),
      type: "acce",
      import_date: importDate,
      status: "done",
    });
  });

  describe("GET /experimental/source/acce", () => {
    it("should returns 401 if api key is not provided", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/experimental/source/acce",
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
        url: "/api/experimental/source/acce",
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
      ["", Object.values(todayImport.acce)],
      ["?uai=0100112T", [todayImport.acce["0100112T"]]],
      ["?limit=2", [todayImport.acce["0010001W"], todayImport.acce["0021518P"]]],
      ["?limit=2&skip=1", [todayImport.acce["0021518P"], todayImport.acce["0022210S"]]],
    ])('should perform search "%s" correctly', async (search, expected) => {
      const response = await app.inject({
        method: "GET",
        url: `/api/experimental/source/acce${search}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect.soft(response.statusCode).toBe(200);
      const result = response.json();
      expect.soft(result).toHaveLength(expected.length);
      expect.soft(result).toEqual(expect.arrayContaining(expected.map(({ data }) => data)));
    });
  });

  describe("GET /experimental/source/acce/zone", () => {
    it("should returns 401 if api key is not provided", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/experimental/source/acce/zone",
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
        url: "/api/experimental/source/acce/zone",
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
      ["", Object.values(todayImport.zone)],
      ["?uai=0100112T", [todayImport.zone["0100112T"]]],
      ["?limit=2", [todayImport.zone["0010001W"], todayImport.zone["0021518P"]]],
      ["?limit=2&skip=1", [todayImport.zone["0021518P"], todayImport.zone["0022210S"]]],
    ])('should perform search "%s" correctly', async (search, expected) => {
      const response = await app.inject({
        method: "GET",
        url: `/api/experimental/source/acce/zone${search}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect.soft(response.statusCode).toBe(200);
      const result = response.json();
      expect.soft(result).toHaveLength(expected.length);
      expect.soft(result).toEqual(expect.arrayContaining(expected.map(({ data }) => data)));
    });
  });

  describe("GET /experimental/source/acce/specialite", () => {
    it("should returns 401 if api key is not provided", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/experimental/source/acce/specialite",
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
        url: "/api/experimental/source/acce/specialite",
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
      ["", Object.values(todayImport.spec)],
      ["?uai=0100112T", [todayImport.spec["0100112T"]]],
      ["?limit=2", [todayImport.spec["0010001W"], todayImport.spec["0021518P"]]],
      ["?limit=2&skip=1", [todayImport.spec["0021518P"], todayImport.spec["0022210S"]]],
    ])('should perform search "%s" correctly', async (search, expected) => {
      const response = await app.inject({
        method: "GET",
        url: `/api/experimental/source/acce/specialite${search}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect.soft(response.statusCode).toBe(200);
      const result = response.json();
      expect.soft(result).toHaveLength(expected.length);
      expect.soft(result).toEqual(expect.arrayContaining(expected.map(({ data }) => data)));
    });
  });

  describe("GET /experimental/source/acce/mere", () => {
    it("should returns 401 if api key is not provided", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/experimental/source/acce/mere",
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
        url: "/api/experimental/source/acce/mere",
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
      ["", Object.values(todayImport.mere)],
      ["?uai=0100112T", [todayImport.mere["0100112T"]]],
      ["?limit=2", [todayImport.mere["0010001W"], todayImport.mere["0021518P"]]],
      ["?limit=2&skip=1", [todayImport.mere["0021518P"], todayImport.mere["0022210S"]]],
    ])('should perform search "%s" correctly', async (search, expected) => {
      const response = await app.inject({
        method: "GET",
        url: `/api/experimental/source/acce/mere${search}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect.soft(response.statusCode).toBe(200);
      const result = response.json();
      expect.soft(result).toHaveLength(expected.length);
      expect.soft(result).toEqual(expect.arrayContaining(expected.map(({ data }) => data)));
    });
  });

  describe("GET /experimental/source/acce/fille", () => {
    it("should returns 401 if api key is not provided", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/experimental/source/acce/fille",
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
        url: "/api/experimental/source/acce/fille",
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
      ["", Object.values(todayImport.fille)],
      ["?uai=0100112T", [todayImport.fille["0100112T"]]],
      ["?limit=2", [todayImport.fille["0010001W"], todayImport.fille["0021518P"]]],
      ["?limit=2&skip=1", [todayImport.fille["0021518P"], todayImport.fille["0022210S"]]],
    ])('should perform search "%s" correctly', async (search, expected) => {
      const response = await app.inject({
        method: "GET",
        url: `/api/experimental/source/acce/fille${search}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect.soft(response.statusCode).toBe(200);
      const result = response.json();
      expect.soft(result).toHaveLength(expected.length);
      expect.soft(result).toEqual(expect.arrayContaining(expected.map(({ data }) => data)));
    });
  });
});
