import { validate } from "@readme/openapi-parser"
import { describe, expect, it } from "vitest"

import { generateOpenApiSchema } from "./generateOpenapi.js"

describe("generateOpenApiSchema", () => {
  const openapi = generateOpenApiSchema("V1.0", "Production", "https://api.apprentissage.beta.gouv.fr", null)

  it("should generate proper schema", async () => {
    expect(openapi).toMatchSnapshot()
  })

  it("should be valid OpenAPI schema", async () => {
    // @readme/openapi-parser type ses entrées avec openapi-types, incompatible
    // structurellement avec les OpenAPIObject d'openapi3-ts que produit le générateur.
    const validationResult = await validate(openapi as unknown as Parameters<typeof validate>[0])
      .then(() => ({ success: true, error: null }))
      .catch((e) => ({ success: false, error: e }))

    expect.soft(validationResult.success).toBe(true)
    expect(validationResult.error).toBe(null)
  })
})
