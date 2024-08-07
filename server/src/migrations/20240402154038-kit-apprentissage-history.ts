import { addJob } from "job-processor";
import { Db, MongoClient } from "mongodb";

import { getDbCollection } from "@/services/mongodb/mongodbService";

export const up = async (_db: Db, _client: MongoClient) => {
  await getDbCollection("source.kit_apprentissage").deleteMany({});
  await addJob({ name: "indexes:recreate", queued: false });
  await addJob({ name: "import:kit_apprentissage", queued: false });
};
