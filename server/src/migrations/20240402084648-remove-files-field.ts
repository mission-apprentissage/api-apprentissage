import { Db, MongoClient } from "mongodb";

import { getDbCollection } from "@/services/mongodb/mongodbService";

export const up = async (_db: Db, _client: MongoClient) => {
  await getDbCollection("source.france_competence").updateMany(
    {},
    { $unset: { files: "" } },
    { bypassDocumentValidation: true }
  );
};
