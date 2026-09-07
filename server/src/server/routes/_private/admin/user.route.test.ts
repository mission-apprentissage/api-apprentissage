import { useMongo } from "@tests/mongo.test.utils.js"
import { generateUserFixture } from "shared/models/fixtures/index"
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

describe("User admin routes", () => {
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

  const body = { prenom: "Jean", nom: "Dupont" }

  describe("GET /api/_private/admin/users/:id", () => {
    // Défensif : un `other_type` fantôme déjà en base (compte antérieur au correctif) ne doit pas
    // ressortir sur la fiche admin.
    it("should clean a phantom other_type stored in database", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", type: "entreprise", other_type: "Résidu" })
      await getDbCollection("users").insertOne(user)

      const response = await app.inject({
        method: "GET",
        url: `/api/_private/admin/users/${user._id}`,
        headers: authHeaders(),
      })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json()).toEqual(expect.objectContaining({ type: "entreprise", other_type: null }))
    })

    it("should return other_type when type is 'autre'", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", type: "autre", other_type: "Association" })
      await getDbCollection("users").insertOne(user)

      const response = await app.inject({
        method: "GET",
        url: `/api/_private/admin/users/${user._id}`,
        headers: authHeaders(),
      })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json()).toEqual(expect.objectContaining({ type: "autre", other_type: "Association" }))
    })
  })

  describe("GET /api/_private/admin/users", () => {
    it("should clean a phantom other_type stored in database", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", type: "entreprise", other_type: "Résidu" })
      await getDbCollection("users").insertOne(user)

      const response = await app.inject({
        method: "GET",
        url: "/api/_private/admin/users",
        headers: authHeaders(),
      })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json()).toEqual(expect.arrayContaining([expect.objectContaining({ email: "user@exemple.fr", type: "entreprise", other_type: null })]))
    })
  })

  describe("PUT /api/_private/admin/users/:id", () => {
    // "other_type fantôme" : l'admin bascule le type sur autre chose que "autre" alors que le
    // formulaire a conservé la précision saisie.
    it("should purge other_type when type is switched away from 'autre'", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", type: "autre", other_type: "Association" })
      await getDbCollection("users").insertOne(user)

      const response = await app.inject({
        method: "PUT",
        url: `/api/_private/admin/users/${user._id}`,
        headers: authHeaders(),
        body: { ...body, type: "entreprise", other_type: "Association" },
      })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json()).toEqual(expect.objectContaining({ type: "entreprise", other_type: null }))

      const updated = await getDbCollection("users").findOne({ _id: user._id })
      expect(updated?.type).toBe("entreprise")
      expect(updated?.other_type).toBe(null)
    })

    it("should update other_type when type is 'autre'", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", type: "entreprise", other_type: null })
      await getDbCollection("users").insertOne(user)

      const response = await app.inject({
        method: "PUT",
        url: `/api/_private/admin/users/${user._id}`,
        headers: authHeaders(),
        body: { ...body, type: "autre", other_type: "Association" },
      })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json()).toEqual(expect.objectContaining({ type: "autre", other_type: "Association" }))

      const updated = await getDbCollection("users").findOne({ _id: user._id })
      expect(updated?.other_type).toBe("Association")
    })

    it("should reject type 'autre' without other_type", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", type: "entreprise", other_type: null })
      await getDbCollection("users").insertOne(user)

      const response = await app.inject({
        method: "PUT",
        url: `/api/_private/admin/users/${user._id}`,
        headers: authHeaders(),
        body: { ...body, type: "autre" },
      })

      expect.soft(response.statusCode).toBe(400)

      const updated = await getDbCollection("users").findOne({ _id: user._id })
      expect(updated?.type).toBe("entreprise")
      expect(updated?.other_type).toBe(null)
    })

    it("should keep other_type on a partial update that does not send type", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", type: "autre", other_type: "Association" })
      await getDbCollection("users").insertOne(user)

      const response = await app.inject({
        method: "PUT",
        url: `/api/_private/admin/users/${user._id}`,
        headers: authHeaders(),
        body: { ...body, is_admin: true },
      })

      expect.soft(response.statusCode).toBe(200)

      const updated = await getDbCollection("users").findOne({ _id: user._id })
      expect(updated?.is_admin).toBe(true)
      expect(updated?.type).toBe("autre")
      expect(updated?.other_type).toBe("Association")
    })

    // Limite documentée dans normalizeOtherType : sans `type` dans le body, la purge ne peut pas
    // s'appliquer et un `other_type` envoyé est persisté tel quel, même sur un compte qui n'est pas
    // de type "autre". Le formulaire admin envoie toujours `type`, la lecture (zUserAdminView) masque
    // ce résidu.
    it("should persist other_type as-is when type is absent from the body (documented limit)", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", type: "entreprise", other_type: null })
      await getDbCollection("users").insertOne(user)

      const response = await app.inject({
        method: "PUT",
        url: `/api/_private/admin/users/${user._id}`,
        headers: authHeaders(),
        body: { ...body, other_type: "Résidu" },
      })

      expect.soft(response.statusCode).toBe(200)
      expect(response.json()).toEqual(expect.objectContaining({ type: "entreprise", other_type: null }))

      const updated = await getDbCollection("users").findOne({ _id: user._id })
      expect(updated?.type).toBe("entreprise")
      expect(updated?.other_type).toBe("Résidu")
    })

    it("should require prenom and nom", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", type: "entreprise" })
      await getDbCollection("users").insertOne(user)

      const response = await app.inject({
        method: "PUT",
        url: `/api/_private/admin/users/${user._id}`,
        headers: authHeaders(),
        body: { type: "entreprise", is_admin: true },
      })

      expect.soft(response.statusCode).toBe(400)

      const updated = await getDbCollection("users").findOne({ _id: user._id })
      expect(updated?.is_admin).toBe(false)
    })

    it("should return 404 when the user does not exist", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/_private/admin/users/6633d7a2a1f6b9d0f0c8e1a2",
        headers: authHeaders(),
        body: { ...body, type: "entreprise" },
      })

      expect(response.statusCode).toBe(404)
    })

    it("should be forbidden for a non-admin user", async () => {
      const user = generateUserFixture({ email: "user@exemple.fr", is_admin: false })
      await getDbCollection("users").insertOne(user)
      const userToken = await createSessionToken(user.email)
      await createSession(user.email)

      const response = await app.inject({
        method: "PUT",
        url: `/api/_private/admin/users/${user._id}`,
        headers: { ["Cookie"]: `api_session=${userToken}` },
        body: { ...body, is_admin: true },
      })

      expect.soft(response.statusCode).toBe(403)

      const updated = await getDbCollection("users").findOne({ _id: user._id })
      expect(updated?.is_admin).toBe(false)
    })
  })
})
