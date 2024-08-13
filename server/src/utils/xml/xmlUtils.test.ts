import { createReadStream } from "fs";
import { dirname, join } from "path";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { parseXmlFileStream } from "./xmlUtils.js";

describe("parseXmlFileStream", () => {
  it("should parse XML file stream and emit open tags", async () => {
    const dataFixture = join(dirname(fileURLToPath(import.meta.url)), `fixtures/file.xml`);

    const xmlFileStream = createReadStream(dataFixture);
    const outputStream = parseXmlFileStream(xmlFileStream, "FICHE");

    const data = [];

    for await (const chunk of outputStream) {
      data.push(chunk);
    }

    expect(data).toMatchSnapshot();
  });

  it("should handle errors during XML parsing", async () => {
    const expectedError = new Error("Error reading XML file");
    function* generateXmlStreamWithReadError() {
      yield '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
      yield "<FICHES><VERSION_FLUX>3.0</VERSI";
      yield "ON_FLUX><FICHE>";
      yield '<ID_FICHE yop="123">22192</ID_FICHE>';

      throw expectedError;
    }
    const xmlFileStream = Readable.from(generateXmlStreamWithReadError());

    const outputStream = parseXmlFileStream(xmlFileStream, "FICHE");

    const error = await new Promise((resolve) => {
      outputStream.on("error", resolve);
    });

    expect(error).toBe(expectedError);
  });

  it("should handle invalid XML file", async () => {
    function* generateXmlStreamWithReadError() {
      yield '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
      yield "<FICHES><VERSION_FLUX>3.0</VERSI";
      yield "ON_FLUX><FICHE>";
      yield '<ID_FICHE yop="123">22192</ID_FICHE>';
    }
    const xmlFileStream = Readable.from(generateXmlStreamWithReadError());

    const outputStream = parseXmlFileStream(xmlFileStream, "FICHE");

    const error = await new Promise((resolve) => {
      outputStream.on("error", resolve);
    });

    expect((error as Error).message).toMatch("Unclosed root tag");
  });
});
