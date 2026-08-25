import type { SchemaWithSecurity } from "api-alternance-sdk"
import { ORGANISATION_HABILITATIONS } from "api-alternance-sdk"
import { generateOrganisationFixture, generateUserFixture } from "shared/models/fixtures/index"
import { describe, expect, it } from "vitest"
import { z } from "zod/v4-mini"
import { zObjectIdMini } from "zod-mongodb-schema"

import { generateAccessToken, generateScope, parseAccessToken } from "./accessTokenService.js"
import type { Ressources } from "./authorisationService.js"
import { isAuthorizedToken, isAuthorizedUser } from "./authorisationService.js"

describe("isAuthorizedToken", () => {
  const requiredUsers = [
    generateUserFixture({ email: "required_1@mail.com" }),
    generateUserFixture({ email: "required_2@mail.com" }),
    generateUserFixture({ email: "required_3@mail.com" }),
  ]
  const otherUsers = [generateUserFixture({ email: "extra_1@mail.com" }), generateUserFixture({ email: "extra_2@mail.com" })]

  const resources: Ressources = {
    users: requiredUsers,
  }

  const schema: SchemaWithSecurity = {
    method: "get",
    path: "/users/:id/status",
    params: z.object({ id: zObjectIdMini }),
    querystring: z.object({ ids: z.array(zObjectIdMini) }),
    securityScheme: {
      auth: "cookie-session",
      access: "user:manage",
      ressources: {
        user: [{ _id: { type: "params", key: "id" } }, { _id: { type: "query", key: "ids" } }],
      },
    },
  }

  it("should allow when all required ressources are allowed", async () => {
    const tokenString = await generateAccessToken(otherUsers[0], [
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
    ])

    const [first, ...rest] = requiredUsers
    const options = {
      params: { id: first._id.toString() },
      querystring: { ids: rest.map((u) => u._id.toString()) },
    }
    const token = await parseAccessToken(tokenString, schema, options.params, options.querystring)
    if (!token) {
      throw new Error("Unexpected")
    }

    expect(isAuthorizedToken(token, resources, schema, options.params, options.querystring)).toBe(true)
  })

  it("should denied when one required ressources from param is not allowed", async () => {
    const [first, ...rest] = requiredUsers

    const tokenString = await generateAccessToken(otherUsers[0], [
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
    ])

    const options = {
      params: { id: first._id.toString() },
      querystring: { ids: rest.map((u) => u._id.toString()) },
    }
    const token = await parseAccessToken(tokenString, schema, options.params, options.querystring)
    if (!token) {
      throw new Error("Unexpected")
    }

    expect(isAuthorizedToken(token, resources, schema, options.params, options.querystring)).toBe(false)
  })

  it("should denied when one required ressources from questring is not allowed", async () => {
    const [first, ...rest] = requiredUsers

    const tokenString = await generateAccessToken(otherUsers[0], [
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
    ])

    const options = {
      params: { id: first._id.toString() },
      querystring: { ids: rest.map((u) => u._id.toString()) },
    }
    const token = await parseAccessToken(tokenString, schema, options.params, options.querystring)
    if (!token) {
      throw new Error("Unexpected")
    }

    expect(isAuthorizedToken(token, resources, schema, options.params, options.querystring)).toBe(false)
  })
})

describe("isAuthorizedUser", () => {
  const user1 = generateUserFixture({ email: "user1@mail.com" })
  const user2 = generateUserFixture({ email: "user2@mail.com" })
  const userOrgWrite = generateUserFixture({ email: "userOrg@mail.com", organisation: "Write Organisation" })
  const userOrgRo = generateUserFixture({ email: "userOrg@mail.com", organisation: "ReadOnly Organisation" })
  const admin1 = generateUserFixture({ email: "admin@mail.com", is_admin: true })
  const admin2 = generateUserFixture({ email: "admin@mail.com", is_admin: true })
  const orgWrite = generateOrganisationFixture({
    nom: "Write Organisation",
    slug: "write-org",
    habilitations: ["jobs:write"],
  })
  const orgRo = generateOrganisationFixture({ nom: "ReadOnly Organisation", slug: "ro-org", habilitations: [] })

  describe("user:manage", () => {
    it("admin user should be allowed for any user", () => {
      expect(isAuthorizedUser("user:manage", admin1, { users: [user1, user2, admin2] }, null, null)).toBe(true)
    })

    it("basic user should be denied for any user (missing permission)", () => {
      expect(isAuthorizedUser("user:manage", user1, { users: [user1] }, null, null)).toBe(false)
    })
  })

  describe("admin", () => {
    it("admin user should be allowed", () => {
      expect(isAuthorizedUser("admin", admin1, { users: [] }, null, null)).toBe(true)
    })

    it("basic user should be denied", () => {
      expect(isAuthorizedUser("admin", user1, { users: [] }, null, null)).toBe(false)
    })
  })

  describe("jobs:write", () => {
    it("admin user should be allowed", () => {
      expect(isAuthorizedUser("jobs:write", admin1, { users: [] }, null, null)).toBe(true)
    })

    it("no org user should be denied", () => {
      expect(isAuthorizedUser("jobs:write", user1, { users: [] }, null, null)).toBe(false)
    })

    it("ReadOnly org user should be denied", () => {
      expect(isAuthorizedUser("jobs:write", userOrgRo, { users: [] }, orgRo, null)).toBe(false)
    })

    it("Write orf user should be allowed", () => {
      expect(isAuthorizedUser("jobs:write", userOrgWrite, { users: [] }, orgWrite, null)).toBe(true)
    })
  })

  describe("sandbox api key", () => {
    // Dérivé de ORGANISATION_HABILITATIONS : une nouvelle habilitation entre automatiquement
    // dans SandboxRole ET dans cette couverture
    it.each([...ORGANISATION_HABILITATIONS])("should grant %s to a user without organisation", (habilitation) => {
      expect(isAuthorizedUser(habilitation, user1, { users: [] }, null, "sandbox")).toBe(true)
    })

    it("should grant habilitations to a user whose organisation doesn't have them", () => {
      expect(isAuthorizedUser("jobs:write", userOrgRo, { users: [] }, orgRo, "sandbox")).toBe(true)
    })

    it("should NOT grant admin permission, even to an admin user", () => {
      expect(isAuthorizedUser("admin", admin1, { users: [] }, null, "sandbox")).toBe(false)
    })

    it("should NOT grant user:manage permission, even to an admin user", () => {
      expect(isAuthorizedUser("user:manage", admin1, { users: [user1] }, null, "sandbox")).toBe(false)
    })

    it("should not change anything for production keys", () => {
      expect(isAuthorizedUser("jobs:write", user1, { users: [] }, null, "production")).toBe(false)
    })

    // Near-miss : une clé production doit PRÉSERVER les rôles positifs (une mutation qui
    // dégraderait tout env non-sandbox passerait sinon la suite au vert)
    it("should preserve org habilitations for production keys", () => {
      expect(isAuthorizedUser("jobs:write", userOrgWrite, { users: [] }, orgWrite, "production")).toBe(true)
    })

    it("should preserve admin role for production keys", () => {
      expect(isAuthorizedUser("admin", admin1, { users: [] }, null, "production")).toBe(true)
    })
  })
})
