import { readFile } from "fs/promises"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { describe, expect, it } from "vitest"

import { assertNotBlockedByDaresAntiBot } from "./dares.anti_bot.js"

function readFixture(name: string): Promise<string> {
  return readFile(join(dirname(fileURLToPath(import.meta.url)), "fixtures", `anti_bot.${name}`), "utf-8")
}

function getThrown(fn: () => void): unknown {
  try {
    fn()
  } catch (error) {
    return error
  }
  return null
}

describe("assertNotBlockedByDaresAntiBot", () => {
  it.each(["js-challenge.html", "captcha.html", "request-rejected.html"])("should report %s with its support ID", async (fixture) => {
    const html = await readFixture(fixture)

    expect(getThrown(() => assertNotBlockedByDaresAntiBot("dares.test", html, 0))).toMatchObject({
      message: "dares.test: blocked by anti-bot protection",
      data: { supportId: "9255351497900000000" },
    })
  })

  it("should report the french support ID label alone", async () => {
    const captcha = await readFixture("captcha.html")
    const withoutNoscript = captcha.replace(/<noscript>.*?<\/noscript>/s, "")
    expect(withoutNoscript).not.toContain("Your support ID is")

    expect(getThrown(() => assertNotBlockedByDaresAntiBot("dares.test", withoutNoscript, 0))).toMatchObject({
      data: { supportId: "9255351497900000000" },
    })
  })

  it("should not report a page that exposes a link", async () => {
    const captcha = await readFixture("captcha.html")

    expect(() => assertNotBlockedByDaresAntiBot("dares.test", captcha, 1)).not.toThrow()
  })

  it.each([
    ["the F5 script injected in a regular page", '<html><head><script type="text/javascript" src="/TSPD/0000?type=7"></script></head><body></body></html>'],
    ["a support contact", "<p>Identifiant de support technique : contactez le support au 0800 000 000</p>"],
    ["a support label without number", "<p>Your support ID is: inconnu</p>"],
  ])("should not report %s", (_label, html) => {
    expect(() => assertNotBlockedByDaresAntiBot("dares.test", html, 0)).not.toThrow()
  })
})
