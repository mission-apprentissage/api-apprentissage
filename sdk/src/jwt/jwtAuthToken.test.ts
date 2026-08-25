import { generateKeyPairSync } from "node:crypto"

import { describe, expect, it } from "vitest"

import type { IApiAlternanceTokenData } from "./jwtAuthToken.js"
import { createApiAlternanceToken, parseApiAlternanceToken } from "./jwtAuthToken.js"

const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "secp521r1" })
const privateKeyPem = privateKey.export({ type: "sec1", format: "pem" }).toString()
const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString()

const baseData: IApiAlternanceTokenData = {
  email: "user@exemple.fr",
  organisation: "Org",
  habilitations: { "jobs:write": true, "applications:write": false, "appointments:write": false },
}

describe("createApiAlternanceToken / parseApiAlternanceToken", () => {
  it("should roundtrip a token carrying the env claim", async () => {
    const token = await createApiAlternanceToken({ data: { ...baseData, env: "sandbox" }, privateKey: privateKeyPem })

    await expect(parseApiAlternanceToken({ token: `Bearer ${token}`, publicKey: publicKeyPem })).resolves.toEqual({
      success: true,
      data: { ...baseData, env: "sandbox" },
    })
  })

  it("should accept a token WITHOUT the env claim (tokens issued before the field)", async () => {
    const token = await createApiAlternanceToken({ data: baseData, privateKey: privateKeyPem })

    await expect(parseApiAlternanceToken({ token: `Bearer ${token}`, publicKey: publicKeyPem })).resolves.toEqual({
      success: true,
      data: baseData,
    })
  })

  it("should reject a token with an unknown env value", async () => {
    const token = await createApiAlternanceToken({
      data: { ...baseData, env: "staging" } as unknown as IApiAlternanceTokenData,
      privateKey: privateKeyPem,
    })

    await expect(parseApiAlternanceToken({ token: `Bearer ${token}`, publicKey: publicKeyPem })).resolves.toEqual({
      success: false,
      reason: "invalid-format",
    })
  })
})
