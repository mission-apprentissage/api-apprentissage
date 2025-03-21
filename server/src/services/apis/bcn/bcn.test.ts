import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import type { ISourceBcn } from "shared/models/source/bcn/source.bcn.model";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { fetchBcnData } from "./bcn.js";

describe("bcn", () => {
  beforeEach(() => {
    disableNetConnect();
  });

  afterEach(() => {
    cleanAll();
    enableNetConnect();
  });

  it.each<[ISourceBcn["source"]]>([
    ["V_FORMATION_DIPLOME"],
    ["N_FORMATION_DIPLOME"],
    ["N_FORMATION_DIPLOME_ENQUETE_51"],
    ["N_NIVEAU_FORMATION_DIPLOME"],
  ])("should fetch data for table %s", async (table) => {
    // uses accent characters to test encoding between latin1 and utf8
    const expectedData = "Un texte avec des caractères accentués";

    const scope = nock("https://bcn.depp.education.fr")
      .post("/bcn/index.php/export/CSV")
      .query({ n: table, separator: ";", withForeign: true })
      .reply(200, Buffer.from(expectedData, "latin1"));

    const stream = await fetchBcnData(table);

    let data = "";
    for await (const chunk of stream) {
      data += chunk.toString("latin1");
    }
    expect(data).toBe(expectedData);
    expect(scope.isDone()).toBe(true);
  });

  it("should throw an error if the request fails", async () => {
    const scope = nock("https://bcn.depp.education.fr")
      .post("/bcn/index.php/export/CSV")
      .query({ n: "V_FORMATION_DIPLOME", separator: ";", withForeign: true })
      .reply(500);

    await expect(fetchBcnData("V_FORMATION_DIPLOME")).rejects.toThrowError("api.bcn: unable to fetchBcnData");
    expect(scope.isDone()).toBe(true);
  });

  it("should throw an error if the request fails", async () => {
    const scope = nock("https://bcn.depp.education.fr")
      .post("/bcn/index.php/export/CSV")
      .query({ n: "V_FORMATION_DIPLOME", separator: ";", withForeign: true })
      .reply(400);

    await expect(fetchBcnData("V_FORMATION_DIPLOME")).rejects.toThrowError("api.bcn: unable to fetchBcnData");
    expect(scope.isDone()).toBe(true);
  });
});
