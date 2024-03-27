import { Db, MongoClient } from "mongodb";

import { getDbCollection } from "../services/mongodb/mongodbService";

export const up = async (_db: Db, _client: MongoClient) => {
  await getDbCollection("users").updateMany(
    {},
    {
      $unset: {
        api_key: true,
        api_key_last_used_at: true,
      },
      $set: { api_keys: [] },
    },
    {
      bypassDocumentValidation: true,
    }
  );
};
