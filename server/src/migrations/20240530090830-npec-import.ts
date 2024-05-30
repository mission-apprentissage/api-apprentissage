import { addJob } from "job-processor";
import { Db, MongoClient } from "mongodb";

import { getDbCollection } from "@/services/mongodb/mongodbService";

export const up = async (_db: Db, _client: MongoClient) => {
  await getDbCollection("import.meta").deleteMany({ type: "npec" });
  await getDbCollection("source.npec").deleteMany({});
  await addJob({ name: "import:npec", queued: true });
};
