import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("import.meta").deleteMany({ type: "npec" });
  await getDbCollection("source.npec").deleteMany({});
  await addJob({ name: "import:npec", queued: true });
};
