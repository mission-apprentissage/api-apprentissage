import { ObjectId } from "bson"
import { describe, expect, it } from "vitest"

import { generateUserFixture } from "./fixtures/user.model.fixture.js"
import { getLastApiKeyUsedAt, normalizeOtherType, USER_ERROR_KEYS, zUserAdminUpdate, zUserAdminView } from "./user.model.js"

describe("normalizeOtherType", () => {
  it("should purge other_type when type is not 'autre'", () => {
    expect(normalizeOtherType({ type: "entreprise", other_type: "Association" })).toEqual({ type: "entreprise", other_type: null })
  })

  it("should keep other_type when type is 'autre'", () => {
    expect(normalizeOtherType({ type: "autre", other_type: "Association" })).toEqual({ type: "autre", other_type: "Association" })
  })

  // Limite documentée : sans `type`, on ne peut pas savoir si `other_type` est légitime, la valeur
  // est conservée telle quelle.
  it("should keep other_type untouched when type is absent", () => {
    expect(normalizeOtherType({ other_type: "Association" })).toEqual({ other_type: "Association" })
  })
})

describe("zUserAdminUpdate", () => {
  const base = { prenom: "Jean", nom: "Dupont" }

  it("should purge other_type when the admin switches type away from 'autre'", () => {
    const result = zUserAdminUpdate.parse({ ...base, type: "entreprise", other_type: "Résidu d'une saisie précédente" })
    expect(result).toEqual({ ...base, type: "entreprise", other_type: null })
  })

  it("should keep other_type when type is 'autre'", () => {
    const result = zUserAdminUpdate.parse({ ...base, type: "autre", other_type: "Association" })
    expect(result).toEqual({ ...base, type: "autre", other_type: "Association" })
  })

  it("should reject type 'autre' without other_type", () => {
    const result = zUserAdminUpdate.safeParse({ ...base, type: "autre", other_type: "   " })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual([expect.objectContaining({ path: ["other_type"], message: USER_ERROR_KEYS.otherTypeRequired })])
    }
  })

  // Limite documentée dans normalizeOtherType : une update partielle sans `type` laisse
  // `other_type` inchangé, y compris si le compte n'est pas de type "autre" en base.
  it("should keep other_type as-is when type is absent", () => {
    const result = zUserAdminUpdate.parse({ ...base, other_type: "Association" })
    expect(result).toEqual({ ...base, other_type: "Association" })
  })

  it("should require prenom and nom", () => {
    const result = zUserAdminUpdate.safeParse({ type: "entreprise", prenom: "", nom: "  " })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path)).toEqual([["prenom"], ["nom"]])
      expect(result.error.issues.every((issue) => issue.message === USER_ERROR_KEYS.requiredField)).toBe(true)
    }
  })
})

describe("zUserAdminView", () => {
  it("should clean a phantom other_type already stored in database", () => {
    const user = generateUserFixture({ _id: new ObjectId(), type: "entreprise", other_type: "Résidu" })
    const result = zUserAdminView.parse(user)
    expect(result.type).toBe("entreprise")
    expect(result.other_type).toBe(null)
  })

  it("should keep other_type when type is 'autre'", () => {
    const user = generateUserFixture({ type: "autre", other_type: "Association" })
    expect(zUserAdminView.parse(user).other_type).toBe("Association")
  })
})

describe("getLastApiKeyUsedAt", () => {
  it("should return null when there is no api key", () => {
    expect(getLastApiKeyUsedAt([])).toBeNull()
  })

  it("should return null when no api key has been used", () => {
    expect(getLastApiKeyUsedAt([{ last_used_at: null }, { last_used_at: null }])).toBeNull()
  })

  it("should return the most recent date whatever the order", () => {
    const oldest = new Date("2024-01-01T00:00:00Z")
    const newest = new Date("2026-09-13T12:00:00Z")
    expect(getLastApiKeyUsedAt([{ last_used_at: oldest }, { last_used_at: newest }])).toEqual(newest)
    expect(getLastApiKeyUsedAt([{ last_used_at: newest }, { last_used_at: oldest }])).toEqual(newest)
  })

  it("should ignore null values mixed with dates", () => {
    const used = new Date("2025-06-01T00:00:00Z")
    expect(getLastApiKeyUsedAt([{ last_used_at: null }, { last_used_at: used }, { last_used_at: null }])).toEqual(used)
  })

  it("should accept ISO strings as produced by JSON serialization", () => {
    expect(getLastApiKeyUsedAt([{ last_used_at: "2024-03-21T00:00:00.000Z" }, { last_used_at: "2025-03-21T00:00:00.000Z" }])).toEqual(new Date("2025-03-21T00:00:00.000Z"))
  })

  it("should ignore unparsable values", () => {
    const used = new Date("2025-06-01T00:00:00Z")
    expect(getLastApiKeyUsedAt([{ last_used_at: "not-a-date" }, { last_used_at: used }])).toEqual(used)
    expect(getLastApiKeyUsedAt([{ last_used_at: "not-a-date" }])).toBeNull()
  })
})
