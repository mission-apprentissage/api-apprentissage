import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("organisme").updateMany(
    { "etablissement.geopoint": { $exists: false } },
    { $set: { "etablissement.geopoint": null } }
  );

  await addJob({
    name: "import:organismes",
    payload: {},
  });
};

export const requireShutdown: boolean = true;
