import type { SchemaWithSecurity } from "api-alternance-sdk";
import { ObjectId } from "mongodb";
import { zRoutes } from "shared";
import { generateUserFixture } from "shared/models/fixtures/index";
import { describe, expect, it } from "vitest";
import { z } from "zod/v4-mini";
import { zObjectId } from "zod-mongodb-schema";

import { generateAccessToken, generateScope, parseAccessToken } from "./accessTokenService.js";

const ids = [new ObjectId().toString(), new ObjectId().toString(), new ObjectId().toString()];

describe("generateScope", () => {
  it("should well-formed scope", () => {
    const schema: SchemaWithSecurity = {
      method: "get",
      path: "/users/:id/:action",
      params: z.object({ id: zObjectId, action: z.string() }),
      querystring: z.object({ ids: z.array(zObjectId), q: z.string() }),
      securityScheme: {
        auth: "cookie-session",
        access: "user:manage",
        ressources: {
          user: [{ _id: { type: "params", key: "id" } }, { _id: { type: "query", key: "ids" } }],
        },
      },
    };

    expect(
      generateScope({
        schema,
        options: "all",
        resources: { user: ids },
      })
    ).toEqual({
      method: "get",
      options: "all",
      path: "/users/:id/:action",
      resources: {
        user: ids,
      },
    });
  });

  it("should throw when missing resource", () => {
    const schema: SchemaWithSecurity = {
      method: "get",
      path: "/users/:id/:action",
      params: z.object({ id: zObjectId, action: z.string() }),
      querystring: z.object({ ids: z.array(zObjectId), q: z.string() }),
      securityScheme: {
        auth: "cookie-session",
        access: "user:manage",
        ressources: {
          user: [{ _id: { type: "params", key: "id" } }, { _id: { type: "query", key: "ids" } }],
        },
      },
    };

    expect(() =>
      generateScope({
        schema,
        options: "all",
        resources: {},
      })
    ).toThrow("generateScope: Missing resource");
    expect(() =>
      generateScope({
        schema,
        options: "all",
        resources: {
          user: [],
          // @ts-expect-error
          yop: [],
        },
      })
    ).toThrow("generateScope: Extra resources");
  });
});

describe("accessTokenService", () => {
  const user = generateUserFixture({ email: "self@mail.com" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    method: "get",
    path: "/users/status/:id",
    params: z.object({ id: zObjectId, action: z.string() }),
    querystring: z.object({ ids: z.array(zObjectId), q: z.string() }),
    securityScheme: {
      auth: "cookie-session",
      access: "user:manage",
      ressources: {
        user: [{ _id: { type: "params", key: "id" } }],
      },
    },
  } satisfies SchemaWithSecurity;

  const options = {
    params: {
      id: ids[0].toString(),
    },
    querystring: {
      q: "hello",
    },
  };

  const expectTokenValid = async (token: string) =>
    await expect(parseAccessToken(token, schema, options.params, options.querystring)).resolves.toBeTruthy();
  const expectTokenInvalid = async (token: string) =>
    expect(parseAccessToken(token, schema, options.params, options.querystring)).rejects.toThrow();

  describe("valid tokens", () => {
    it("should generate a token valid for a specific route", async () => {
      const token = await generateAccessToken(user, [
        generateScope({
          schema,
          options: "all",
          resources: { user: ids },
        }),
      ]);
      await expectTokenValid(token);
    });
    it("should generate a token valid for a generic route", async () => {
      const token = await generateAccessToken(user, [
        generateScope({
          schema,
          resources: { user: ids },
          options: {
            querystring: { q: "hello" },
            params: undefined,
          },
        }),
      ]);
      await expectTokenValid(token);
    });
  });
  describe("invalid tokens", () => {
    it("should detect an invalid token that has a different param", async () => {
      const token = await generateAccessToken(user, [
        generateScope({
          schema,
          resources: { user: ids },
          options: {
            params: {
              user: ids,
            },
            querystring: {
              q: "not allowed",
            },
          },
        }),
      ]);
      await expectTokenInvalid(token);
    });
    it("should detect an invalid token that is for a different route", async () => {
      const token = await generateAccessToken(user, [
        generateScope({
          schema: zRoutes.get["/_private/admin/users"],
          resources: {},
          options: "all",
        }),
      ]);
      await expectTokenInvalid(token);
    });

    it("should throw when missing/extra resource", () => {
      expect(() =>
        generateScope({
          schema,
          options: "all",
          resources: {},
        })
      ).toThrow("generateScope: Missing resource");
      expect(() =>
        generateScope({
          schema,
          options: "all",
          resources: {
            user: [],
            recruiters: [],
          },
        })
      ).toThrow("generateScope: Extra resources");
    });
  });
});
