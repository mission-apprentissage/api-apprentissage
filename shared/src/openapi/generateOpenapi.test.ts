import OpenAPIParser from "@readme/openapi-parser";
import {
  dereferenceOpenapiSchema,
  generateOpenApiPathsObjectFromZod,
  getOpeanipOperations,
} from "api-alternance-sdk/internal";
import diff from "microdiff";
import type { OpenAPIObject } from "openapi3-ts/oas31";
import { beforeAll, describe, expect, it } from "vitest";

import { zRoutes } from "../routes/index.js";
import { generateOpenApiSchema } from "./generateOpenapi.js";

describe("generateOpenApiSchema", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openapi: any = generateOpenApiSchema("V1.0", "Production", "https://api.apprentissage.beta.gouv.fr", "fr");

  it("should generate proper schema", async () => {
    expect(openapi).toMatchSnapshot();
  });

  it("should be valid OpenAPI schema", async () => {
    const validationResult = await OpenAPIParser.validate(openapi)
      .then(() => ({ success: true, error: null }))
      .catch((e) => ({ success: false, error: e }));

    expect.soft(validationResult.success).toBe(true);
    expect(validationResult.error).toBe(null);
  });

  const expectedPaths = generateOpenApiPathsObjectFromZod(zRoutes, "Test");
  let resolvedOpenapi: OpenAPIObject;

  beforeAll(async () => {
    resolvedOpenapi = await dereferenceOpenapiSchema(openapi);
  });

  it("should be alright %s", async () => {
    expect(diff(getOpeanipOperations(resolvedOpenapi.paths), getOpeanipOperations(expectedPaths))).toMatchSnapshot();
  });
});
