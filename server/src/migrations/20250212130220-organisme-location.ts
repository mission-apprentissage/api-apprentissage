import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("cache.entreprise").deleteMany({});

  await getDbCollection("organisme").updateMany(
    { "etablissement.geopoint": { $exists: false } },
    { $set: { "etablissement.geopoint": null } },
    { bypassDocumentValidation: true }
  );

  await addJob({
    name: "import:organismes",
    payload: {},
    queued: true,
  });
};

export const requireShutdown: boolean = true;
