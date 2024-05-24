import nock from "nock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { scrapeRessourceNPEC } from "./npec.scraper";

describe("scrapeRessourceNPEC", () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should scrape the download links", async () => {
    const scope = nock("https://www.francecompetences.fr/referentiels-et-bases-de-donnees");
    scope
      .get("/")
      .query({
        thematics: "financement-de-la-formation-professionnelle-et-de-lapprentissage",
        group: "referentiels",
        paged: 1,
      })
      .reply(
        200,
        `
      <html>
      <body>
      <div class="block--documents-list__results">
        <a href="https://example.com/file1.xlsx" download></a>
        <a href="https://example.com/file2.xlsx" download></a>
        <a href="https://example.com/file3.xlsx" download></a>
      </div>
      </body>
      </html>
    `
      );
    scope
      .get("/")
      .query({
        thematics: "financement-de-la-formation-professionnelle-et-de-lapprentissage",
        group: "referentiels",
        paged: 2,
      })
      .reply(
        200,
        `
      <html>
      <body>
      <div class="block--documents-list__results">
      </div>
      </body>
      </html>
    `
      );

    const result = await scrapeRessourceNPEC();

    expect(result).toEqual([
      "https://example.com/file1.xlsx",
      "https://example.com/file2.xlsx",
      "https://example.com/file3.xlsx",
    ]);

    expect(nock.isDone()).toBe(true);
  });

  it("should error if number of pages is above 10", async () => {
    const content = `
  <html>
  <body>
  <div class="block--documents-list__results">
    <a href="https://example.com/file1.xlsx" download></a>
    <a href="https://example.com/file2.xlsx" download></a>
    <a href="https://example.com/file3.xlsx" download></a>
  </div>
  </body>
  </html>
`;
    const scope = nock("https://www.francecompetences.fr/referentiels-et-bases-de-donnees");
    for (let i = 1; i <= 10; i++) {
      scope
        .get("/")
        .query({
          thematics: "financement-de-la-formation-professionnelle-et-de-lapprentissage",
          group: "referentiels",
          paged: i,
        })
        .reply(200, content);
    }

    await expect(scrapeRessourceNPEC()).rejects.toThrowError("");
    expect(nock.isDone()).toBe(true);
  });
});
