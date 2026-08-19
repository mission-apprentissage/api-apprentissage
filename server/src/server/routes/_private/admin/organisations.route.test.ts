import { useMongo } from "@tests/mongo.test.utils.js"
import { generateOrganisationFixture, generateUserFixture } from "shared/models/fixtures/index"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import { createSession, createSessionToken } from "@/actions/sessions.actions.js"
import type { Server } from "@/server/server.js"
import createServer from "@/server/server.js"
import { getDbCollection } from "@/services/mongodb/mongodbService.js"

vi.mock("@/services/mailer/mailer", () => {
  return {
    sendEmail: vi.fn(),
  }
})

useMongo()

describe("Organisation admin routes", () => {
  let app: Server
  let sessionToken: string

  const admin = generateUserFixture({
    email: "admin@exemple.fr",
    is_admin: true,
  })

  beforeAll(async () => {
    app = await createServer()
    await app.ready()

    return () => app.close()
  }, 15_000)

  beforeEach(async () => {
    await getDbCollection("users").insertOne(admin)
    sessionToken = await createSessionToken(admin.email)
    await createSession(admin.email)

    return () => {
      sessionToken = ""
    }
  })

  const authHeaders = () => ({ ["Cookie"]: `api_session=${sessionToken}` })

  describe("POST /api/_private/admin/organisations", () => {
    it("should create an organisation", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/_private/admin/organisations",
        headers: authHeaders(),
        body: { nom: "Ma Super Organisation" },
      })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json()).toEqual(
        expect.objectContaining({
          nom: "Ma Super Organisation",
          slug: "ma-super-organisation",
          habilitations: [],
        })
      )
    })

    it("should return a 409 with the existing organisation when the name is already taken", async () => {
      const existing = generateOrganisationFixture({ nom: "Ma Super Organisation", slug: "ma-super-organisation" })
      await getDbCollection("organisations").insertOne(existing)

      const response = await app.inject({
        method: "POST",
        url: "/api/_private/admin/organisations",
        headers: authHeaders(),
        body: { nom: "Ma Super Organisation" },
      })

      expect.soft(response.statusCode).toBe(409)
      expect(response.json()).toEqual({
        statusCode: 409,
        name: "Conflict",
        message: "Une organisation portant ce nom existe déjà",
        data: { id: existing._id.toString(), nom: "Ma Super Organisation" },
      })
    })

    it("should detect a conflict on the slug even when the name case differs", async () => {
      const existing = generateOrganisationFixture({ nom: "Ma Super Organisation", slug: "ma-super-organisation" })
      await getDbCollection("organisations").insertOne(existing)

      const response = await app.inject({
        method: "POST",
        url: "/api/_private/admin/organisations",
        headers: authHeaders(),
        body: { nom: "MA SUPER ORGANISATION" },
      })

      expect.soft(response.statusCode).toBe(409)
      expect(response.json().data).toEqual({ id: existing._id.toString(), nom: "Ma Super Organisation" })
    })
  })

  describe("GET /api/_private/admin/organisations", () => {
    const alpha = generateOrganisationFixture({ nom: "Alpha Formation", slug: "alpha-formation", habilitations: ["jobs:write"] })
    const beta = generateOrganisationFixture({ nom: "Beta Emploi", slug: "beta-emploi", habilitations: ["applications:write", "appointments:write"] })
    const gamma = generateOrganisationFixture({ nom: "Gamma (spécial)", slug: "gamma-special", habilitations: [] })

    beforeEach(async () => {
      await getDbCollection("organisations").insertMany([alpha, beta, gamma])
    })

    it("should return every organisation without filter", async () => {
      const response = await app.inject({ method: "GET", url: "/api/_private/admin/organisations", headers: authHeaders() })

      expect.soft(response.statusCode).toBe(200)
      expect(
        response
          .json()
          .map((o: { nom: string }) => o.nom)
          .sort()
      ).toEqual(["Alpha Formation", "Beta Emploi", "Gamma (spécial)"])
    })

    it("should filter by name, case insensitively", async () => {
      const response = await app.inject({ method: "GET", url: "/api/_private/admin/organisations?q=alpha", headers: authHeaders() })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json().map((o: { nom: string }) => o.nom)).toEqual(["Alpha Formation"])
    })

    it("should escape regexp special characters in the search", async () => {
      const response = await app.inject({ method: "GET", url: `/api/_private/admin/organisations?q=${encodeURIComponent("Gamma (spécial)")}`, headers: authHeaders() })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json().map((o: { nom: string }) => o.nom)).toEqual(["Gamma (spécial)"])
    })

    it("should filter by a single habilitation", async () => {
      const response = await app.inject({ method: "GET", url: "/api/_private/admin/organisations?habilitations=jobs:write", headers: authHeaders() })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json().map((o: { nom: string }) => o.nom)).toEqual(["Alpha Formation"])
    })

    it("should return organisations matching any of the selected habilitations", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/_private/admin/organisations?habilitations=jobs:write&habilitations=appointments:write",
        headers: authHeaders(),
      })

      expect.soft(response.statusCode).toBe(200)
      expect(
        response
          .json()
          .map((o: { nom: string }) => o.nom)
          .sort()
      ).toEqual(["Alpha Formation", "Beta Emploi"])
    })

    it("should combine the search and the habilitations filters", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/_private/admin/organisations?q=beta&habilitations=jobs:write",
        headers: authHeaders(),
      })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json()).toEqual([])
    })

    it("should reject an unknown habilitation", async () => {
      const response = await app.inject({ method: "GET", url: "/api/_private/admin/organisations?habilitations=unknown:write", headers: authHeaders() })

      expect(response.statusCode).toBe(400)
    })
  })
})
