import { accesHabilitationsSectionOpenapi, buildOpenApiSchema } from "api-alternance-sdk/internal"
// Import par défaut : redoc est publié en CommonJS, ses exports nommés ne sont pas détectés en ESM
import redoc from "redoc"
import { describe, expect, it } from "vitest"

describe("accesHabilitationsSectionOpenapi", () => {
  it.each(["fr", "en"] as const)("should point to the Redoc id of the intro heading (%s)", (lang) => {
    const { title, anchor } = accesHabilitationsSectionOpenapi
    const description = buildOpenApiSchema("0.0.0", "test", "https://api-test.apprentissage.beta.gouv.fr/api", lang).getSpec().info.description ?? ""

    // Redoc n'identifie que les titres de niveau 1 de l'intro par `section/<slug>`
    expect(description.split("\n")).toContain(`# ${title[lang]}`)
    expect(anchor[lang]).toBe(`section/${redoc.safeSlugify(title[lang])}`)
  })
})
