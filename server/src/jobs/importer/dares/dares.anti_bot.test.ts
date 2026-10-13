import { readFile } from "fs/promises"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { describe, expect, it } from "vitest"

import { getDaresAntiBotSupportId } from "./dares.anti_bot.js"

function readFixture(name: string): Promise<string> {
  return readFile(join(dirname(fileURLToPath(import.meta.url)), "fixtures", `anti_bot.${name}`), "utf-8")
}

describe("getDaresAntiBotSupportId", () => {
  it.each(["js-challenge.html", "captcha.html", "request-rejected.html"])("should extract the support ID from %s", async (fixture) => {
    expect(getDaresAntiBotSupportId(await readFixture(fixture))).toBe("9255351497900000000")
  })

  it("should extract the support ID from the french label alone", async () => {
    const captcha = await readFixture("captcha.html")
    const withoutNoscript = captcha.replace(/<noscript>.*?<\/noscript>/s, "")
    expect(withoutNoscript).not.toContain("Your support ID is")

    expect(getDaresAntiBotSupportId(withoutNoscript)).toBe("9255351497900000000")
  })

  it.each([
    ["the F5 script injected in a regular page", '<html><head><script type="text/javascript" src="/TSPD/0000?type=7"></script></head><body></body></html>'],
    ["a support contact", "<p>Identifiant de support technique : contactez le support au 0800 000 000</p>"],
    ["a support label without number", "<p>Your support ID is: inconnu</p>"],
  ])("should return null for %s", (_label, html) => {
    expect(getDaresAntiBotSupportId(html)).toBeNull()
  })
})
