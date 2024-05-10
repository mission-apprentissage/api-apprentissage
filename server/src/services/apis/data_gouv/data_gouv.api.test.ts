import { ReadStream } from "node:fs";

import nock from "nock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { downloadDataGouvResource, fetchDataGouvDataSet } from "./data_gouv.api";

describe("fetchDataGouvDataSet", () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  const datasetId = "5eebbc067a14b6fecc9c9976";

  it("should fetch the data set successfully", async () => {
    const rawData = {
      id: "5eebbc067a14b6fecc9c9976",
      title: "Répertoire national des certifications professionnelles et répertoire spécifique",
      resources: [
        {
          created_at: "2024-02-22T03:02:02.578000+00:00",
          id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
          last_modified: "2024-02-22T03:02:07.320000+00:00",
          latest: "https://www.data.gouv.fr/fr/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
          title: "export-fiches-csv-2024-02-22.zip",
          mime: "application/zip", // Extra property should be accepted
        },
        {
          created_at: "2024-02-22T03:00:46.090000+00:00",
          id: "06ffc0a9-8937-4f89-b724-b773495847b7",
          last_modified: "2024-02-22T03:00:50.657000+00:00",
          latest: "https://www.data.gouv.fr/fr/datasets/r/06ffc0a9-8937-4f89-b724-b773495847b7",
          title: "export-fiches-rs-v3-0-2024-02-22.zip",
          mime: "application/zip", // Extra property should be accepted
        },
      ],
      frequency: "daily", // Extra property should be accepted
    };

    nock("https://www.data.gouv.fr/api/1").get(`/datasets/${datasetId}`).reply(200, JSON.stringify(rawData));

    await expect(fetchDataGouvDataSet(datasetId)).resolves.toEqual({
      id: rawData.id,
      title: rawData.title,
      resources: rawData.resources.map((resource) => ({
        created_at: new Date(resource.created_at),
        id: resource.id,
        last_modified: new Date(resource.last_modified),
        latest: resource.latest,
        title: resource.title,
      })),
    });
  });

  it("should throw an error if fetching the data set fails", async () => {
    nock("https://www.data.gouv.fr/api/1")
      .get(`/datasets/${datasetId}`)
      .reply(500, { message: "Internal server error" });

    await expect(fetchDataGouvDataSet(datasetId)).rejects.toThrowError("api.data_gouv: unable to fetchDataGouvDataSet");
  });

  it("should throw an error if data schema changed", async () => {
    nock("https://www.data.gouv.fr/api/1")
      .get(`/datasets/${datasetId}`)
      .reply(
        200,
        JSON.stringify({
          id: "5eebbc067a14b6fecc9c9976",
          title: "Répertoire national des certifications professionnelles et répertoire spécifique",
        })
      );

    await expect(fetchDataGouvDataSet(datasetId)).rejects.toThrowError(
      "api.data_gouv: unable to fetchDataGouvDataSet; unexpected api data"
    );
  });
});

describe("downloadDataGouvResource", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it("should download response and return a readStream", async () => {
    const scope = nock("https://www.data.gouv.fr/fr")
      .get("/datasets/r/06ffc0a9-8937-4f89-b724-b773495847b7")
      .reply(200, "Here is your data");

    const stream = await downloadDataGouvResource({
      created_at: new Date("2024-02-22T03:00:46.090000+00:00"),
      id: "06ffc0a9-8937-4f89-b724-b773495847b7",
      last_modified: new Date("2024-02-22T03:00:50.657000+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/06ffc0a9-8937-4f89-b724-b773495847b7",
      title: "export-fiches-rs-v3-0-2024-02-22.zip",
    });

    expect(stream).toEqual(expect.any(ReadStream));

    scope.done();

    let data = "";
    for await (const chunk of stream) {
      data += chunk as string;
    }

    expect(data).toBe("Here is your data");
  });
});
