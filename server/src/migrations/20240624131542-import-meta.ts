import { Db, MongoClient } from "mongodb";

import { getDbCollection } from "@/services/mongodb/mongodbService";

export const up = async (_db: Db, _client: MongoClient) => {
  await getDbCollection("import.meta").updateMany(
    { status: null },
    { $set: { status: "done" } },
    { bypassDocumentValidation: true }
  );
};
