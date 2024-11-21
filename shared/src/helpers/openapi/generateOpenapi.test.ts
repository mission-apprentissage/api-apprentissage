import OpenAPIParser from "@readme/openapi-parser";
import diff from "microdiff";
import type { OpenAPIObject, PathItemObject } from "openapi3-ts/oas31";
import { beforeAll, describe, expect, it } from "vitest";

import { zRoutes } from "../../routes/index.js";
import { getOperationObjectStructure } from "./compareOpenapiStructure.js";
import { experimentalGenerateOpenApiPathsObject, generateOpenApiSchema } from "./generateOpenapi.js";

function getPathItemObjectStructure(pathItem: PathItemObject | undefined) {
  if (!pathItem) {
    return {};
  }

  return JSON.parse(
    JSON.stringify({
      get: getOperationObjectStructure(pathItem.get),
      put: getOperationObjectStructure(pathItem.put),
      post: getOperationObjectStructure(pathItem.post),
      delete: getOperationObjectStructure(pathItem.delete),
      options: getOperationObjectStructure(pathItem.options),
      head: getOperationObjectStructure(pathItem.head),
      patch: getOperationObjectStructure(pathItem.patch),
    })
  );
}

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

  const expectedPaths = experimentalGenerateOpenApiPathsObject(zRoutes);
  let resolvedOpenapi: OpenAPIObject;

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolvedOpenapi = (await OpenAPIParser.dereference(openapi)) as any;
  });

  const paths = Object.entries(openapi.paths).filter(([path]) => path.startsWith("/job/v1"));

  it.each<[string, unknown]>(paths)("should be alright %s", async (path) => {
    expect(
      diff(getPathItemObjectStructure(resolvedOpenapi.paths?.[path]), getPathItemObjectStructure(expectedPaths[path]))
    ).toMatchSnapshot();
  });
});
