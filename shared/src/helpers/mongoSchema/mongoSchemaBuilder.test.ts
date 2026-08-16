import { zParisLocalDate } from "api-alternance-sdk/internal"
import { describe, expect, it } from "vitest"

import type { $ZodType, JSONSchema } from "zod/v4/core"
import { zodToMongoSchema } from "zod-mongodb-schema"
import { modelDescriptors } from "../../models/models.js"

describe("zodToMongoSchema", () => {
  modelDescriptors.forEach((descriptor) => {
    it(`should convert ${descriptor.collectionName} schema`, () => {
      expect(
        zodToMongoSchema(descriptor.zod, (z: $ZodType): JSONSchema.BaseSchema | null => {
          if (z === zParisLocalDate) {
            return {
              ["bsonType"]: "date",
            }
          }

          return null
        })
      ).toMatchSnapshot()
    })
  })
})
