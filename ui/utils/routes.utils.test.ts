import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { isNotionPage, isPage, PAGES } from "./routes.utils";

describe("PAGES", () => {
  const langDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../app/[lang]");
  const pages = readdirSync(langDir, { recursive: true, withFileTypes: true })
    .map((file) => {
      if (file.isDirectory()) return null;
      if (file.name !== "page.tsx") return null;
      const name = path.relative(langDir, file.parentPath);
      // 404 page
      if (name === "[...rest]") return null;
      return `/${name}`;
    })
    .filter((p) => p !== null);

  it.each(pages.map((page) => [page]))("should contains page %s", (page) => {
    expect(isPage(page)).toBe(true);
  });

  it("should all  PAGES exists", () => {
    expect(Object.keys(PAGES.static).length + Object.keys(PAGES.dynamic).length).toBe(
      pages.filter((page) => !isNotionPage(page)).length
    );
  });
});