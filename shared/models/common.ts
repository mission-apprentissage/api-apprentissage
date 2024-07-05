import type { CreateIndexesOptions, IndexSpecification } from "mongodb";
import { ZodType } from "zod";

export interface IModelDescriptorGeneric<CollectionName = string, LocalZodType = ZodType> {
  zod: LocalZodType;
  indexes: [IndexSpecification, CreateIndexesOptions][];
  collectionName: CollectionName;
}

export { zObjectId } from "zod-mongodb-schema";
