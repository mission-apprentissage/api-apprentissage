import type { CreateIndexesOptions, IndexSpecification } from "mongodb";
import { ZodType } from "zod";

export type CollectionName =
  | "certifications"
  | "email_denied"
  | "email_events"
  | "import.meta"
  | "sessions"
  | "users"
  | "indicateurs.usage_api"
  | "source.acce"
  | "source.bcn"
  | "source.referentiel"
  | "source.catalogue"
  | "source.kit_apprentissage"
  | "source.france_competence"
  | "source.npec"
  | "source.npec.normalized";

export interface IModelDescriptor {
  zod: ZodType;
  indexes: [IndexSpecification, CreateIndexesOptions][];
  collectionName: CollectionName;
}

export { zObjectId } from "zod-mongodb-schema";
