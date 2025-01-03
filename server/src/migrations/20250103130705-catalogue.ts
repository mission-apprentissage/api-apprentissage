import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("source.catalogue").deleteMany({});
  await addJob({ name: "import:catalogue", queued: true });
};
