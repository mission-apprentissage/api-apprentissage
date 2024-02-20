import type { CreateIndexesOptions, IndexSpecification } from "mongodb";
import { ZodType } from "zod";

export type CollectionName =
  | "email_denied"
  | "email_events"
  | "sessions"
  | "users"
  | "source.acce"
  | "source.bcn"
  | "source.referentiel"
  | "source.kit_apprentissage";

export interface IModelDescriptor {
  zod: ZodType;
  indexes: [IndexSpecification, CreateIndexesOptions][];
  collectionName: CollectionName;
}

export { zObjectId } from "zod-mongodb-schema";
