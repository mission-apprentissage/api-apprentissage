import { ReadStream } from "node:fs";
import { Readable } from "node:stream";

import { describe, expect, it } from "vitest";

import { downloadFileInTmpFile } from "./apiUtils";

describe("apiUtils", () => {
  it("should download response and return a readStream", async () => {
    const inputStream = Readable.from("Here is your data");

    const stream = await downloadFileInTmpFile(inputStream, "data.zip");
    expect(stream).toEqual(expect.any(ReadStream));

    let data = "";
    for await (const chunk of stream) {
      data += chunk as string;
    }

    expect(data).toBe("Here is your data");
  });
});
