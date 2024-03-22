import { useMongo } from "@tests/mongo.test.utils";
import { beforeAll, describe, expect, it } from "vitest";

import { createSession, createSessionToken } from "@/actions/sessions.actions";
import { createUser } from "@/actions/users.actions";
import { getDbCollection } from "@/services/mongodb/mongodbService";
import { createUserTokenSimple } from "@/utils/jwtUtils";

import createServer, { Server } from "../../server";

describe("Users routes", () => {
  useMongo();
  let app: Server;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    return () => app.close();
  }, 15_000);

  it("should get the current user with authorization token", async () => {
    const user = await createUser({
      email: "connected@exemple.fr",
      password: "my-password",
      is_admin: false,
    });

    const token = createSessionToken(user.email);
    await createSession({ token });

    const userWithToken = await getDbCollection("users").findOne({ _id: user._id });

    expect(userWithToken?.api_keys).toHaveLength(0);

    const response = await app.inject({
      method: "GET",
      url: "/api/_private/auth/session",
      headers: {
        ["Cookie"]: `api_session=${token}`,
      },
    });

    const userResponse = response.json();

    expect(response.statusCode).toBe(200);
    expect(userResponse).toEqual({
      _id: user._id.toString(),
      email: "connected@exemple.fr",
      is_admin: false,
      has_api_key: false,
      api_key_used_at: null,
      created_at: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
      updated_at: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
    });
  });

  it("should allow admin to create a user", async () => {
    const admin = await createUser({
      email: "admin@exemple.fr",
      password: "my-password",
      is_admin: true,
    });

    const token = createUserTokenSimple({ payload: { email: admin.email } });

    await createSession({
      token,
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/_private/admin/user",
      payload: {
        email: "email@exemple.fr",
        password: "my-password",
        is_admin: false,
      },
      headers: {
        ["Cookie"]: `api_session=${token}`,
      },
    });

    const user = await getDbCollection("users").findOne({
      email: "email@exemple.fr",
    });

    const userResponse = response.json();

    expect(response.statusCode).toBe(200);
    expect(userResponse).toEqual({
      _id: user?._id.toString(),
      email: "email@exemple.fr",
      is_admin: false,
      has_api_key: false,
      api_key_used_at: null,
      created_at: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
      updated_at: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
    });
  });

  it("should not allow non-admin to create a user", async () => {
    const user = await createUser({
      email: "user@exemple.fr",
      password: "my-password",
      is_admin: false,
    });

    const token = createUserTokenSimple({ payload: { email: user.email } });

    await createSession({
      token,
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/_private/admin/user",
      payload: {
        email: "email@exemple.fr",
        password: "my-password",
        organisation_id: "64520f65d7726475fd54b3b7",
      },
      headers: {
        ["Cookie"]: `api_session=${token}`,
      },
    });

    expect(response.statusCode).toBe(403);
  });
});
