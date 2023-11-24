import { ObjectId } from "mongodb";
import { IUser } from "shared/models/user.model";
import { zRoutes } from "shared/routes";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zObjectId } from "zod-mongodb-schema";

import {
  generateAccessToken,
  generateScope,
  parseAccessToken,
  SchemaWithSecurity,
} from "../../../src/security/accessTokenService";

const mockUser = (email: string): IUser => {
  return {
    _id: new ObjectId(),
    email,
    password: "",
    is_admin: false,
    api_key: null,
    api_key_used_at: null,
    updated_at: new Date(),
    created_at: new Date(),
  };
};
const ids = [new ObjectId().toString(), new ObjectId().toString(), new ObjectId().toString()];

describe("generateScope", () => {
  it("should well-formed scope", () => {
    const schema: SchemaWithSecurity = {
      method: "get",
      path: "/users/:id/:action",
      params: z.object({ id: zObjectId, action: z.string() }).strict(),
      querystring: z.object({ ids: z.array(zObjectId), q: z.string() }).strict(),
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
      params: z.object({ id: zObjectId, action: z.string() }).strict(),
      querystring: z.object({ ids: z.array(zObjectId), q: z.string() }).strict(),
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
  const user = mockUser("self@mail.com");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    method: "get",
    path: "/users/status/:id",
    params: z.object({ id: zObjectId, action: z.string() }).strict(),
    querystring: z.object({ ids: z.array(zObjectId), q: z.string() }).strict(),
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

  const expectTokenValid = (token: string) =>
    expect(parseAccessToken(token, schema, options.params, options.querystring)).toBeTruthy();
  const expectTokenInvalid = (token: string) =>
    expect(() => parseAccessToken(token, schema, options.params, options.querystring)).toThrow();

  describe("valid tokens", () => {
    it("should generate a token valid for a specific route", () => {
      const token = generateAccessToken(user, [
        generateScope({
          schema,
          options: "all",
          resources: { user: ids },
        }),
      ]);
      expectTokenValid(token);
    });
    it("should generate a token valid for a generic route", () => {
      const token = generateAccessToken(user, [
        generateScope({
          schema,
          resources: { user: ids },
          options: {
            querystring: { q: "hello" },
            params: undefined,
          },
        }),
      ]);
      expectTokenValid(token);
    });
  });
  describe("invalid tokens", () => {
    it("should detect an invalid token that has a different param", () => {
      const token = generateAccessToken(user, [
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
      expectTokenInvalid(token);
    });
    it("should detect an invalid token that is for a different route", () => {
      const token = generateAccessToken(user, [
        generateScope({
          schema: zRoutes.post["/admin/user"],
          resources: {},
          options: "all",
        }),
      ]);
      expectTokenInvalid(token);
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
