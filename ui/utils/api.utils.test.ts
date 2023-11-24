import { describe, expect, it } from "vitest";

import { generateUrl } from "./api.utils";

describe("generateUrl", () => {
  it("should generate correct url", () => {
    expect(
      generateUrl("/courses/:id", {
        params: { id: "routing" },
        querystring: { a: "hello", b: "world" },
      })
    ).toBe("http://localhost:5000/api/courses/routing?a=hello&b=world");
  });
});
