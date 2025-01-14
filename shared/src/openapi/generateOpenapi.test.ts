import OpenAPIParser from "@readme/openapi-parser";
import { stripOpenAPIObjectDescriptions } from "api-alternance-sdk/internal";
import { describe, expect, it } from "vitest";

import { generateOpenApiSchema } from "./generateOpenapi.js";

describe("generateOpenApiSchema", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openapi: any = generateOpenApiSchema("V1.0", "Production", "https://api.apprentissage.beta.gouv.fr", "fr");

  it("should generate proper schema", async () => {
    expect(stripOpenAPIObjectDescriptions(openapi)).toMatchSnapshot();
  });

  it("should be valid OpenAPI schema", async () => {
    const validationResult = await OpenAPIParser.validate(openapi)
      .then(() => ({ success: true, error: null }))
      .catch((e) => ({ success: false, error: e }));

    expect.soft(validationResult.success).toBe(true);
    expect(validationResult.error).toBe(null);
  });
});
