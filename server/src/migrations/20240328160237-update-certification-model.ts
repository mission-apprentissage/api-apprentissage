import { addJob } from "job-processor";
import { Db, MongoClient } from "mongodb";

import { getDbCollection } from "@/services/mongodb/mongodbService";

export const up = async (_db: Db, _client: MongoClient) => {
  // Resest certifications collection
  await getDbCollection("certifications").deleteMany({});
  await addJob({ name: "indexes:recreate", queued: false });
  await addJob({ name: "import:certifications", payload: { force: true }, queued: false });
};
