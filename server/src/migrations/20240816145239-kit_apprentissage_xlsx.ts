import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("source.kit_apprentissage").deleteMany({});
  await addJob({ name: "import:kit_apprentissage", queued: false });
  await addJob({ name: "import:certifications", queued: false });
};
