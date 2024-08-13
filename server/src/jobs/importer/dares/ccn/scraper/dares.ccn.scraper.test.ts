import { readFile } from "fs/promises";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { scrapeRessourceCcn } from "./dares.ccn.scraper.js";

describe("scrapeRessourceCcn", () => {
  beforeEach(() => {
    disableNetConnect();
  });

  afterEach(() => {
    cleanAll();
    enableNetConnect();
  });

  it("should scrape the download links", async () => {
    const scope = nock("https://travail-emploi.gouv.fr");
    scope
      .get("/dialogue-social/negociation-collective/article/conventions-collectives-nomenclatures")
      .reply(200, await readFile(join(dirname(fileURLToPath(import.meta.url)), "../fixtures/article.html"), "utf-8"));
    scope
      .head("/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx")
      .reply(200, "", { "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT" });

    const result = await scrapeRessourceCcn();

    expect(result).toEqual({
      url: "https://travail-emploi.gouv.fr/IMG/xlsx/dares_donnes_identifiant_convention_collective_juin24.xlsx",
      date: new Date("2024-06-06T22:00:00.000Z"),
      title: "Liste des conventions collectives et de leur code IDCC - Juin 2024",
    });

    expect(nock.isDone()).toBe(true);
  });
});
