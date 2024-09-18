import type { z, ZodType } from "zod";
import { ZodError } from "zod";

export class ApiParseError extends Error {
  constructor(zodError: ZodError) {
    super(
      "api-alternance-sdk: Error while parsing API response, this is either a bug in the SDK or a change in the API response. Please report this issue.\n\tZodErrors: " +
        zodError.toString().split("\n").join("\n\t")
    );
    this.name = "ApiParseError";
    this.cause = zodError;
  }
}

export function parseApiResponse<T extends ZodType>(data: unknown, schema: T): z.output<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiParseError(error);
    }
    throw error;
  }
}
