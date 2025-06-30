import { z } from "zod/v4-mini";
import { $ZodError, treeifyError } from "zod/v4/core";
import type { $ZodType } from "zod/v4/core";

export class ApiParseError extends Error {
  constructor(zodError: $ZodError) {
    super(
      "api-alternance-sdk: Error while parsing API response, this is either a bug in the SDK or a change in the API response. Please report this issue.\n" +
        JSON.stringify(treeifyError(zodError))
    );
    this.name = "ApiParseError";
    this.cause = zodError;
  }
}

export function parseApiResponse<T extends $ZodType>(data: unknown, schema: T): z.output<T> {
  try {
    return z.parse(schema, data);
  } catch (error) {
    if (error instanceof $ZodError) {
      throw new ApiParseError(error);
    }
    throw error;
  }
}
