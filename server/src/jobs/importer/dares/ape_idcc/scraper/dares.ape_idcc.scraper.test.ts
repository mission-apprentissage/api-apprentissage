import { readFile } from "fs/promises"
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { scrapeRessourceApeIdcc } from "./dares.ape_idcc.scraper.js"

const ARTICLE_PATH = "/donnees/les-portraits-statistiques-de-branches-professionnelles"

function readFixture(name: string): Promise<string> {
  return readFile(join(dirname(fileURLToPath(import.meta.url)), "../fixtures", name), "utf-8")
}

describe("scrapeRessourceApeIdcc", () => {
  beforeEach(() => {
    disableNetConnect()
  })

  afterEach(() => {
    cleanAll()
    enableNetConnect()
  })

  it("should scrape the download links", async () => {
    const scope = nock("https://dares.travail-emploi.gouv.fr")
    scope
      .get("/donnees/les-portraits-statistiques-de-branches-professionnelles")
      .reply(200, await readFile(join(dirname(fileURLToPath(import.meta.url)), "../fixtures/article.html"), "utf-8"))
    scope
      .head("/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx")
      .reply(200, "", { "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT" })

    const result = await scrapeRessourceApeIdcc()

    expect(result).toEqual({
      url: "https://dares.travail-emploi.gouv.fr/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx",
      date: new Date("2024-06-06T22:00:00.000Z"),
      title: "Table de passage entre la convention collective (code IDCC) et le secteur d'activité (code APE)",
    })

    expect(nock.isDone()).toBe(true)
  })

  it("should report the anti-bot protection with its support ID", async () => {
    nock("https://dares.travail-emploi.gouv.fr")
      .get(ARTICLE_PATH)
      .reply(200, await readFixture("../../fixtures/anti_bot.js-challenge.html"))

    const error = await scrapeRessourceApeIdcc().catch((e: unknown) => e)

    expect(error).toMatchObject({
      message: "dares.ape_idcc.scraper: blocked by anti-bot protection",
      data: { supportId: "9255351497900000000" },
    })
  })

  describe("should not mistake a regular page for the anti-bot protection", () => {
    it("when the article markup changed and the F5 script is injected", async () => {
      const article = await readFixture("article.html")
      const withoutLink = article.replaceAll('data-title="Table de passage', 'data-label="Table de passage')
      const withF5Script = withoutLink.replace("</head>", '<script type="text/javascript" src="/TSPD/0000?type=7"></script></head>')
      nock("https://dares.travail-emploi.gouv.fr").get(ARTICLE_PATH).reply(200, withF5Script)

      await expect(scrapeRessourceApeIdcc()).rejects.toThrow("dares.ape_idcc.scraper: unexpected number of links")
    })

    it("when the article contains a support ID but still exposes the link", async () => {
      const article = await readFixture("article.html")
      const withSupportId = article.replace("</body>", "<p>Your support ID is: 9255351497900000000</p></body>")
      const scope = nock("https://dares.travail-emploi.gouv.fr")
      scope.get(ARTICLE_PATH).reply(200, withSupportId)
      scope.head(/\/IDCC2021_passageAPEIDCC_diff_version_web\.xlsx$/).reply(200, "", { "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT" })

      await expect(scrapeRessourceApeIdcc()).resolves.toMatchObject({
        title: "Table de passage entre la convention collective (code IDCC) et le secteur d'activité (code APE)",
      })
    })
  })
})
