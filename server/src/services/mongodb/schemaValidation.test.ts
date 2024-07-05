import { startAndConnectMongodb, stopMongodb } from "@tests/mongo.test.utils";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { countInvalidDocuments, validateDocuments } from "@/jobs/db/schemaValidation";

import { clearAllCollections, getDatabase } from "./mongodbService";

describe("schemaValidation", () => {
  beforeEach(async () => {
    await clearAllCollections();
  });

  beforeAll(async () => {
    await startAndConnectMongodb();
    await getDatabase().createCollection("shipping", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          title: "Shipping Country Validation",
          properties: {
            country: {
              enum: ["France", "United Kingdom", "United States"],
              description: "Must be either France, United Kingdom, or United States",
            },
          },
        },
      },
    });

    return async () => {
      await getDatabase().dropCollection("shipping");
      await stopMongodb();
    };
  });

  describe("countInvalidDocuments", () => {
    it("should return invalid documents count", async () => {
      await getDatabase()
        .collection("shipping")
        .insertMany(
          [
            {
              item: "sweater",
              size: "medium",
              country: "Germany", // Invalid
            },
            {
              item: "sweater",
              size: "medium",
              country: "France", // Valid
            },
            {
              item: "pants",
              size: "medium",
              country: "Japan", // Invalid
            },
          ],
          {
            bypassDocumentValidation: true,
          }
        );

      await expect(countInvalidDocuments("shipping")).resolves.toBe(2);
    });

    it("should return 0 when documents are valid", async () => {
      await getDatabase()
        .collection("shipping")
        .insertMany(
          [
            {
              item: "sweater",
              size: "medium",
              country: "United States",
            },
            {
              item: "sweater",
              size: "medium",
              country: "France",
            },
            {
              item: "pants",
              size: "medium",
              country: "United Kingdom",
            },
          ],
          {
            bypassDocumentValidation: true,
          }
        );

      await expect(countInvalidDocuments("shipping")).resolves.toBe(0);
    });
  });

  describe("validateDocuments", () => {
    it("should reject when at least one document is invalid", async () => {
      await getDatabase()
        .collection("shipping")
        .insertMany(
          [
            {
              item: "sweater",
              size: "medium",
              country: "Germany", // Invalid
            },
            {
              item: "sweater",
              size: "medium",
              country: "France", // Valid
            },
            {
              item: "pants",
              size: "medium",
              country: "Japan", // Invalid
            },
          ],
          {
            bypassDocumentValidation: true,
          }
        );

      await expect(validateDocuments("shipping")).rejects.toThrowError(
        "Collection shipping contains 2 invalid documents"
      );
    });

    it("should resolves when all documents are valid", async () => {
      await getDatabase()
        .collection("shipping")
        .insertMany(
          [
            {
              item: "sweater",
              size: "medium",
              country: "United States",
            },
            {
              item: "sweater",
              size: "medium",
              country: "France",
            },
            {
              item: "pants",
              size: "medium",
              country: "United Kingdom",
            },
          ],
          {
            bypassDocumentValidation: true,
          }
        );

      await expect(validateDocuments("shipping")).resolves.toBeUndefined();
    });
  });
});
