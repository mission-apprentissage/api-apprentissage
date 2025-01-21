import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("formation").updateMany(
    {
      "lieu.uai": { $exists: false },
    },
    {
      $set: { "lieu.uai": null },
    },
    { bypassDocumentValidation: true }
  );
  await addJob({ name: "import:catalogue", queued: true });
};

export const requireShutdown: boolean = false;
