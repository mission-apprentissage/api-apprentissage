import { generateUserFixture } from "shared/models/fixtures";
import { SchemaWithSecurity } from "shared/routes/common.routes";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zObjectId } from "zod-mongodb-schema";

import { generateAccessToken, generateScope, parseAccessToken } from "./accessTokenService";
import { isAuthorizedToken, isAuthorizedUser, Ressources } from "./authorisationService";

describe("isAuthorizedToken", () => {
  const requiredUsers = [
    generateUserFixture({ email: "required_1@mail.com" }),
    generateUserFixture({ email: "required_2@mail.com" }),
    generateUserFixture({ email: "required_3@mail.com" }),
  ];
  const otherUsers = [
    generateUserFixture({ email: "extra_1@mail.com" }),
    generateUserFixture({ email: "extra_2@mail.com" }),
  ];

  const resources: Ressources = {
    users: requiredUsers,
  };

  const schema: SchemaWithSecurity = {
    method: "get",
    path: "/users/:id/status",
    params: z.object({ id: zObjectId }).strict(),
    querystring: z.object({ ids: z.array(zObjectId) }).strict(),
    securityScheme: {
      auth: "cookie-session",
      access: "user:manage",
      ressources: {
        user: [{ _id: { type: "params", key: "id" } }, { _id: { type: "query", key: "ids" } }],
      },
    },
  };

  it("should allow when all required ressources are allowed", () => {
    const tokenString = generateAccessToken(otherUsers[0], [
      generateScope({
        schema,
        resources: {
          user: [...requiredUsers, ...otherUsers].map((user) => user._id.toString()),
        },
        options: {
          params: undefined,
          querystring: undefined,
        },
      }),
    ]);

    const [first, ...rest] = requiredUsers;
    const options = {
      params: { id: first._id.toString() },
      querystring: { ids: rest.map((u) => u._id.toString()) },
    };
    const token = parseAccessToken(tokenString, schema, options.params, options.querystring);
    if (!token) {
      throw new Error("Unexpected");
    }

    expect(isAuthorizedToken(token, resources, schema, options.params, options.querystring)).toBe(true);
  });

  it("should denied when one required ressources from param is not allowed", () => {
    const [first, ...rest] = requiredUsers;

    const tokenString = generateAccessToken(otherUsers[0], [
      generateScope({
        schema,
        resources: {
          user: rest.map((user) => user._id.toString()),
        },
        options: {
          params: undefined,
          querystring: undefined,
        },
      }),
    ]);

    const options = {
      params: { id: first._id.toString() },
      querystring: { ids: rest.map((u) => u._id.toString()) },
    };
    const token = parseAccessToken(tokenString, schema, options.params, options.querystring);
    if (!token) {
      throw new Error("Unexpected");
    }

    expect(isAuthorizedToken(token, resources, schema, options.params, options.querystring)).toBe(false);
  });

  it("should denied when one required ressources from questring is not allowed", () => {
    const [first, ...rest] = requiredUsers;

    const tokenString = generateAccessToken(otherUsers[0], [
      generateScope({
        schema,
        resources: {
          user: [first, rest[0]].map((user) => user._id.toString()),
        },
        options: {
          params: undefined,
          querystring: undefined,
        },
      }),
    ]);

    const options = {
      params: { id: first._id.toString() },
      querystring: { ids: rest.map((u) => u._id.toString()) },
    };
    const token = parseAccessToken(tokenString, schema, options.params, options.querystring);
    if (!token) {
      throw new Error("Unexpected");
    }

    expect(isAuthorizedToken(token, resources, schema, options.params, options.querystring)).toBe(false);
  });
});

describe("isAuthorizedUser", () => {
  const user1 = generateUserFixture({ email: "user1@mail.com" });
  const user2 = generateUserFixture({ email: "user2@mail.com" });
  const admin1 = generateUserFixture({ email: "admin@mail.com", is_admin: true });
  const admin2 = generateUserFixture({ email: "admin@mail.com", is_admin: true });

  describe("admin permission", () => {
    it("admin user should be allowed for any user", () => {
      expect(isAuthorizedUser("user:manage", admin1, { users: [user1, user2, admin2] })).toBe(true);
    });
  });

  describe("user permission", () => {
    it("basic user should be denied for any user (missing permission)", () => {
      expect(isAuthorizedUser("user:manage", user1, { users: [user1] })).toBe(false);
    });
  });
});