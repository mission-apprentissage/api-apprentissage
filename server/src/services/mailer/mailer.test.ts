import path from "node:path"
import { describe, expect, it, vi } from "vitest"
import { deserializeEmailTemplate } from "@/utils/jwtUtils.js"

// `getStaticDirPath` résout `../static` depuis le module compilé (`server/dist`) : lancé depuis
// les sources, il pointe vers `server/src/static` qui n'existe pas.
vi.mock("@/utils/getStaticFilePath.js", () => ({
  getStaticDirPath: () => path.join(import.meta.dirname, "../../../static"),
  getStaticFilePath: (relativeFilename: string) => path.join(import.meta.dirname, "../../../static", relativeFilename),
}))

const { renderEmail } = await import("./mailer.js")

describe("renderEmail", () => {
  const template = {
    name: "magic-link",
    to: "dev@exemple.fr",
    token: "a-token",
  } as const

  it("should build a preview link carrying the serialized template", async () => {
    const html = await renderEmail(template, null)

    const match = html.match(/\/_private\/emails\/preview\?data=([^"&\s]+)/)

    expect(match).not.toBeNull()

    // Sans `await` sur la sérialisation, le lien porte `[object Promise]`.
    await expect(deserializeEmailTemplate(match![1])).resolves.toEqual(template)
  })
})
