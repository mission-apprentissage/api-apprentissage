import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("source.bcn").deleteMany({});
  await addJob({ name: "indexes:recreate", queued: false });
  await addJob({ name: "import:bcn", queued: false });
};
