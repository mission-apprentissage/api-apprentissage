import nock, { cleanAll } from "nock";
import { Readable } from "stream";
import { afterEach, describe, expect, it } from "vitest";

import { fetchCatalogueData } from "./catalogue.js";

describe("getAllFormationsFromCatalogue", () => {
  afterEach(() => {
    cleanAll();
  });

  it("should return a Readable stream", async () => {
    const scopeCount = nock("https://catalogue-apprentissage.intercariforef.org")
      .get("/api/v1/entity/formations/count")
      .query({
        query: '{"published":true}',
      })
      .reply(200, "2");

    let scopeDataOptions = null;

    const scopeData = nock("https://catalogue-apprentissage.intercariforef.org")
      .get("/api/v1/entity/formations.json")
      .query((options) => {
        scopeDataOptions = options;
        return true;
      })
      .reply(200, JSON.stringify([{ id: "1" }, { id: 2 }]));

    const stream = await fetchCatalogueData();
    expect(stream).toBeInstanceOf(Readable);

    scopeCount.done();
    scopeData.done();

    expect(scopeDataOptions).toMatchSnapshot();

    const data = [];
    for await (const chunk of stream) {
      data.push(chunk);
    }

    expect(data).toEqual([{ id: "1" }, { id: 2 }]);
  });
});
