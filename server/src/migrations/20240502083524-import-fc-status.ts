import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("import.meta").updateMany({ type: "france_competence" }, { $set: { status: "done" } });
  await addJob({ name: "import:certifications", payload: { force: true }, queued: false });
};
