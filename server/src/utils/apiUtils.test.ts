import { ReadStream } from "node:fs";
import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";

import { describe, expect, it } from "vitest";

import {
  cleanupTmp,
  computeFileHash,
  downloadFileAsStream,
  downloadFileAsTmp,
  readTmpAsStreamAndCleanup,
} from "./apiUtils";
import { sleep } from "./asyncUtils";

describe("downloadFileAsStream", () => {
  it("should download response and return a readStream", async () => {
    const inputStream = Readable.from("Here is your data");

    const stream = await downloadFileAsStream(inputStream, "data.zip");
    expect(stream).toEqual(expect.any(ReadStream));

    let data = "";
    for await (const chunk of stream) {
      data += chunk as string;
    }

    expect(data).toBe("Here is your data");
  });
});

describe("downloadFileAsTmp", () => {
  it("should download response and return a readStream", async () => {
    const inputStream = Readable.from("Here is your data");

    const filepath = await downloadFileAsTmp(inputStream, "data.zip");
    expect(filepath).toEqual(expect.any(String));
    expect(await readFile(filepath, "utf-8")).toBe("Here is your data");
  });
});

describe("cleanupTmp", () => {
  it("should remove the directory", async () => {
    const dir = await mkdtemp(join(tmpdir(), `api-tests-`));
    const file = join(dir, "test.txt");
    await cleanupTmp(file);
    await expect(stat(dir)).rejects.toThrow("ENOENT: no such file or directory, stat");
  });
});

describe("readTmpAsStreamAndCleanup", () => {
  it("should read the file as a stream and cleanup the file", async () => {
    const dir = await mkdtemp(join(tmpdir(), `api-tests-`));
    const file = join(dir, "test.txt");
    await writeFile(file, "Here is your data");

    const stream = await readTmpAsStreamAndCleanup(file);
    expect(stream).toEqual(expect.any(ReadStream));

    let data = "";
    for await (const chunk of stream) {
      data += chunk as string;
    }

    expect(data).toBe("Here is your data");
    await sleep(10);
    await expect(stat(file)).rejects.toThrow("ENOENT: no such file or directory, stat");
  });
});

describe("computeFileHash", () => {
  it.each([
    ["Here is your data", "e66ba405acb6c027b10b74d0ee549a50fe35c9f5fb5fd0169113780c6b976195"],
    ["Here is your data!", "86e84af69765864c00389bf34eb8b238915bade2512cbc220257d4b09174c4b9"],
  ])("should compute the hash of a file", async (content, expected) => {
    const inputStream = Readable.from(content, { encoding: "utf-8" });

    const hash = await computeFileHash(inputStream);
    expect(hash).toBe(expected);
  });
});
