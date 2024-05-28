import archiver from "archiver";
import nock from "nock";
import { dirname, join } from "path";
import { Stream } from "stream";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getStaticFilePath } from "@/utils/getStaticFilePath";

import { downloadXlsxNPECFile, scrapeRessourceNPEC } from "./npec.scraper";

vi.mock("@/utils/getStaticFilePath", () => ({
  getStaticFilePath: vi.fn(),
}));

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

async function readStreamData(stream: Stream) {
  return new Promise<string>((resolve, reject) => {
    let data = "";

    stream.on("data", (chunk) => {
      data += chunk;
    });

    stream.on("end", () => {
      resolve(data);
    });

    stream.on("error", reject);
  });
}

describe("downloadXlsxNPECFile", () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should download plain XLSX file", async () => {
    const url = "https://www.francecompetences.fr/upload/file1.xlsx";
    const scope = nock("https://www.francecompetences.fr/upload").get("/file1.xlsx").reply(200, "file content");

    const result = await downloadXlsxNPECFile(url);

    expect(readStreamData(result)).resolves.toBe("file content");
    expect(scope.isDone()).toBe(true);
  });

  it("should extract XLSX file from ZIP", async () => {
    const archive = archiver("zip");
    archive.append("file content", { name: "file1.xlsx" });
    await archive.finalize();

    const url = "https://www.francecompetences.fr/upload/archive.zip";
    const scope = nock("https://www.francecompetences.fr/upload").get("/archive.zip").reply(200, archive);

    const result = await downloadXlsxNPECFile(url);

    expect(readStreamData(result)).resolves.toBe("file content");
    expect(scope.isDone()).toBe(true);
  });

  it("should throw error if zip contains more than one entry", async () => {
    const archive = archiver("zip");
    archive.append("file content", { name: "file1.xlsx" });
    archive.append("file content", { name: "file2.xlsx" });
    await archive.finalize();

    const url = "https://www.francecompetences.fr/upload/archive.zip";
    const scope = nock("https://www.francecompetences.fr/upload").get("/archive.zip").reply(200, archive);

    await expect(downloadXlsxNPECFile(url)).rejects.toThrowError(
      "npec.scraper.downloadXlsxNPECFile: too many entries found in zip"
    );

    expect(scope.isDone()).toBe(true);
  });

  it("should throw error if zip does not contains xlsx", async () => {
    const archive = archiver("zip");
    archive.append("file content", { name: "file1.xlsb" });
    await archive.finalize();

    const url = "https://www.francecompetences.fr/upload/archive.zip";
    const scope = nock("https://www.francecompetences.fr/upload").get("/archive.zip").reply(200, archive);

    await expect(downloadXlsxNPECFile(url)).rejects.toThrowError(
      "npec.scraper.downloadXlsxNPECFile: unexpected file type"
    );

    expect(scope.isDone()).toBe(true);
  });

  it("should throw an error for unsupported file extensions", async () => {
    const url = "https://example.com/file.txt";

    await expect(downloadXlsxNPECFile(url)).rejects.toThrowError(
      "npec.scraper.downloadXlsxNPECFile: unexpected file extension"
    );
  });

  it.each([["VF_17.03.2021_Référentiel-NPEC-20192020_avec_idcc"], ["Referentiel-NPEC-20222023_v24.08.203"]])(
    'should use manually converted xlsx files for "%s"',
    async (filename) => {
      try {
        vi.mocked(getStaticFilePath).mockImplementation(() =>
          join(dirname(fileURLToPath(import.meta.url)), `fixtures/file.txt`)
        );

        const result = await downloadXlsxNPECFile(`https://www.francecompetences.fr/upload/${filename}.xlsb.zip`);
        expect(readStreamData(result)).resolves.toBe("file content\n");
        expect(getStaticFilePath).toHaveBeenCalledTimes(1);
        expect(getStaticFilePath).toHaveBeenCalledWith(`npec/${filename}.xlsx`);
      } catch (e) {
        console.error(e);
        expect.fail();
      }
    }
  );
});
