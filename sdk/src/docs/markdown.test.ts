import { access, constants, readdir, readFile } from "fs/promises";
import { join } from "path";
import { expect, it } from "vitest";

import { __dirname } from "../utils/esmUtils.js";

const testCase: [string][] = await readdir(__dirname(import.meta), {
  withFileTypes: true,
  recursive: true,
}).then((files) =>
  files.filter((file) => file.isFile() && file.name.endsWith(".md")).map((file) => [join(file.parentPath, file.name)])
);

it.each<[string]>(testCase)("should markdown file %s be in sync", async (file) => {
  const orginalMarkdown = await readFile(file, "utf-8");

  const tsFile = `${file}.ts`;
  await expect(access(tsFile, constants.R_OK)).resolves.toBeUndefined();

  const tsMarkdown = await import(tsFile);

  expect(tsMarkdown.default).toBe(orginalMarkdown);
});
