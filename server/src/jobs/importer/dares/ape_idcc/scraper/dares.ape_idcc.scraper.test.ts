import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { scrapeRessourceApeIdcc } from "./dares.ape_idcc.scraper.js";

describe("scrapeRessourceApeIdcc", () => {
  beforeEach(() => {
    disableNetConnect();
  });

  afterEach(() => {
    cleanAll();
    enableNetConnect();
  });

  it("should scrape the download links", async () => {
    const scope = nock("https://dares.travail-emploi.gouv.fr");
    scope
      .get("/donnees/les-portraits-statistiques-de-branches-professionnelles")
      .reply(200, await readFile(join(dirname(fileURLToPath(import.meta.url)), "../fixtures/article.html"), "utf-8"));
    scope
      .head("/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx")
      .reply(200, "", { "last-modified": "Sun, 06 Jun 2024 22:00:00 GMT" });

    const result = await scrapeRessourceApeIdcc();

    expect(result).toEqual({
      url: "https://dares.travail-emploi.gouv.fr/sites/default/files/2034d039cf1e7fed7eac52c2cae984b9/IDCC2021_passageAPEIDCC_diff_version_web.xlsx",
      date: new Date("2024-06-06T22:00:00.000Z"),
      title: "Table de passage entre la convention collective (code IDCC) et le secteur d'activité (code APE)",
    });

    expect(nock.isDone()).toBe(true);
  });
});
