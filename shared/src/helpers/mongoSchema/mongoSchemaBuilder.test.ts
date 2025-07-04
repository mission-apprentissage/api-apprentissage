import { describe, expect, it } from "vitest";
import { zodToMongoSchema } from "zod-mongodb-schema";

import type { $ZodType, JSONSchema } from "zod/v4/core";
import { zParisLocalDate } from "api-alternance-sdk/internal";
import { modelDescriptors } from "../../models/models.js";

describe("zodToMongoSchema", () => {
  modelDescriptors.forEach((descriptor) => {
    it(`should convert ${descriptor.collectionName} schema`, () => {
      expect(
        zodToMongoSchema(descriptor.zod, (z: $ZodType): JSONSchema.Schema | null => {
          if (z === zParisLocalDate) {
            return {
              type: "string",
              format: "date-time",
            };
          }

          return null;
        })
      ).toMatchSnapshot();
    });
  });
});
