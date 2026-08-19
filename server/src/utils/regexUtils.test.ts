import { describe, expect, it } from "vitest"

import { escapeRegExp } from "./regexUtils.js"

describe("escapeRegExp", () => {
  it("should escape regexp special characters", () => {
    expect(escapeRegExp("a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o")).toBe("a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n\\\\o")
  })

  it("should leave plain text untouched", () => {
    expect(escapeRegExp("Ma Super Organisation")).toBe("Ma Super Organisation")
  })
})
