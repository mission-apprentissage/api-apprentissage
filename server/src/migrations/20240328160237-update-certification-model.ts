import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  // Resest certifications collection
  await getDbCollection("certifications").deleteMany({});
  await addJob({ name: "indexes:recreate", queued: false });
  await addJob({ name: "import:certifications", payload: { force: true }, queued: false });
};
