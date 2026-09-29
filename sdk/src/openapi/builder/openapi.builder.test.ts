import { describe, expect, it } from "vitest"
import { buildOpenApiSchema } from "./openapi.builder.js"

function buildSpec(lang: "fr" | "en") {
  return buildOpenApiSchema("0.0.0", "test", "https://api-test.apprentissage.beta.gouv.fr/api", lang).getSpec()
}

function getHabilitationRow(lang: "fr" | "en", habilitation: string): string {
  const row = (buildSpec(lang).info.description ?? "").split("\n").find((line) => line.startsWith(`| \`${habilitation}\` |`))

  if (!row) {
    throw new Error(`Ligne ${habilitation} absente du tableau des habilitations (${lang})`)
  }

  return row
}

describe("buildOpenApiSchema#description", () => {
  it.each(["fr", "en"] as const)("should list the routes enforcing each habilitation (%s)", (lang) => {
    expect(getHabilitationRow(lang, "jobs:write")).toContain("`POST /job/v1/offer`")
    expect(getHabilitationRow(lang, "jobs:write")).toContain("`PUT /job/v1/offer/{id}`")
    // Même chemin que le PUT, mais en lecture libre
    expect(getHabilitationRow(lang, "jobs:write")).not.toContain("`GET /job/v1/offer/{id}`")
    expect(getHabilitationRow(lang, "applications:write")).toContain("`POST /job/v1/apply`")
    expect(getHabilitationRow(lang, "appointments:write")).toContain("`POST /formation/v1/appointment/generate-link`")
    // Route de lecture qui exige pourtant une habilitation
    expect(getHabilitationRow(lang, "appointments:write")).toContain("`GET /formation/v1/appointment/links`")
  })
})

describe("buildOpenApiSchema#habilitationNotice", () => {
  it("should not promise sandbox access on routes restricted to partner organisations", () => {
    const paths = buildSpec("fr").paths ?? {}

    expect(paths["/formation/v1/appointment/generate-link"]?.post?.description).toContain("une clé sandbox ne lève pas cette restriction")
    expect(paths["/formation/v1/appointment/generate-link"]?.post?.description).not.toContain("Accordée d'office")
    expect(paths["/formation/v1/appointment/links"]?.get?.description).not.toContain("Accordée d'office")
    expect(paths["/job/v1/offer"]?.post?.description).toContain("Accordée d'office avec une clé sandbox")
    expect(paths["/job/v1/search"]?.get?.description).not.toContain("Habilitation requise")
  })
})
