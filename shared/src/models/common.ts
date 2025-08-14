import type { CreateIndexesOptions, IndexSpecification } from "mongodb";
import type { $ZodType } from "zod/v4/core";

export interface IModelDescriptorGeneric<CollectionName = string, LocalZodType = $ZodType> {
  zod: LocalZodType;
  indexes: [IndexSpecification, CreateIndexesOptions][];
  collectionName: CollectionName;
}

export { zObjectIdMini } from "zod-mongodb-schema";
