import { addJob } from "job-processor";
import { Db, MongoClient } from "mongodb";

import { getDbCollection } from "@/services/mongodb/mongodbService";

export const up = async (_db: Db, _client: MongoClient) => {
  await getDbCollection("import.meta").updateMany({ type: "france_competence" }, { $set: { status: "done" } });
  await addJob({ name: "import:certifications", payload: { force: true }, queued: false });
};
