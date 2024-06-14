import { Db, MongoClient } from "mongodb";

import { getDbCollection } from "@/services/mongodb/mongodbService";

export const up = async (_db: Db, _client: MongoClient) => {
  await getDbCollection("import.meta").updateMany(
    { type: { $nin: ["bcn", "kit_apprentissage", "acce"] } },
    { $set: { status: "done" } }
  );
};
