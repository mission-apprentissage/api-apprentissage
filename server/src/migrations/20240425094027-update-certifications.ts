import { addJob } from "job-processor";
import { Db, MongoClient } from "mongodb";

export const up = async (_db: Db, _client: MongoClient) => {
  await addJob({ name: "import:certifications", payload: { force: true }, queued: false });
};
