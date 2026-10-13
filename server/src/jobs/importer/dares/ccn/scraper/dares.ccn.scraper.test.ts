import { readFile } from "fs/promises"
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { scrapeRessourceCcn } from "./dares.ccn.scraper.js"

const ARTICLE_PATH = "/dialogue-social/negociation-collective/article/conventions-collectives-nomenclatures"
const FILE_PATH = "/sites/travail-emploi/files/2024-10/Liste%20des%20conventions%20collectives%20et%20de%20leur%20code%20IDCC%20-%20octobre%202024.xlsx"

function readFixture(name: string): Promise<string> {
  return readFile(join(dirname(fileURLToPath(import.meta.url)), "../fixtures", name), "utf-8")
}

describe("scrapeRessourceCcn", () => {
  beforeEach(() => {
    disableNetConnect()
  })

  afterEach(() => {
    cleanAll()
    enableNetConnect()
  })

  it("should scrape the download links", async () => {
    const scope = nock("https://travail-emploi.gouv.fr")
    scope.get(ARTICLE_PATH).reply(200, await readFixture("article.html"))
    scope.head(FILE_PATH).reply(200, "", { "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT" })

    const result = await scrapeRessourceCcn()

    expect(result).toEqual({
      url: "https://travail-emploi.gouv.fr/sites/travail-emploi/files/2024-10/Liste%20des%20conventions%20collectives%20et%20de%20leur%20code%20IDCC%20-%20octobre%202024.xlsx",
      date: new Date("2024-06-06T22:00:00.000Z"),
      title: "Liste des conventions collectives et de leur code IDCC - octobre 2024",
    })

    expect(nock.isDone()).toBe(true)
  })

  describe("when the anti-bot protection answers instead of the article", () => {
    it.each([
      ["JavaScript challenge", "antibot-js-challenge.html"],
      ["captcha", "antibot-captcha.html"],
      ["request rejected", "antibot-request-rejected.html"],
    ])("should report the %s with its support ID", async (_label, fixture) => {
      nock("https://travail-emploi.gouv.fr")
        .get(ARTICLE_PATH)
        .reply(200, await readFixture(fixture))

      const error = await scrapeRessourceCcn().catch((e: unknown) => e)

      expect(error).toMatchObject({
        message: "dares.ccn.scraper: blocked by anti-bot protection",
        data: { supportId: "9255351497900000000" },
      })
    })

    it("should detect the french support ID label alone", async () => {
      const captcha = await readFixture("antibot-captcha.html")
      const withoutNoscript = captcha.replace(/<noscript>.*?<\/noscript>/s, "")
      expect(withoutNoscript).not.toContain("Your support ID is")
      nock("https://travail-emploi.gouv.fr").get(ARTICLE_PATH).reply(200, withoutNoscript)

      await expect(scrapeRessourceCcn()).rejects.toThrow("dares.ccn.scraper: blocked by anti-bot protection")
    })
  })

  describe("should not mistake a regular page for the anti-bot protection", () => {
    it("when the article markup changed and the F5 script is injected", async () => {
      const article = await readFixture("article.html")
      const withoutLink = article.replaceAll("fr-link--download", "fr-link")
      const withF5Script = withoutLink.replace("</head>", '<script type="text/javascript" src="/TSPD/0000?type=7"></script></head>')
      nock("https://travail-emploi.gouv.fr").get(ARTICLE_PATH).reply(200, withF5Script)

      await expect(scrapeRessourceCcn()).rejects.toThrow("dares.ccn.scraper: unexpected number of links")
    })

    it("when the page mentions a support contact", async () => {
      const page = "<html><body><p>Identifiant de support technique : contactez le support au 0800 000 000</p></body></html>"
      nock("https://travail-emploi.gouv.fr").get(ARTICLE_PATH).reply(200, page)

      await expect(scrapeRessourceCcn()).rejects.toThrow("dares.ccn.scraper: unexpected number of links")
    })

    it("when the article contains a support ID but still exposes the link", async () => {
      const article = await readFixture("article.html")
      const withSupportId = article.replace("</body>", "<p>Your support ID is: 9255351497900000000</p></body>")
      const scope = nock("https://travail-emploi.gouv.fr")
      scope.get(ARTICLE_PATH).reply(200, withSupportId)
      scope.head(FILE_PATH).reply(200, "", { "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT" })

      await expect(scrapeRessourceCcn()).resolves.toMatchObject({
        title: "Liste des conventions collectives et de leur code IDCC - octobre 2024",
      })
    })
  })
})
