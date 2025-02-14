import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("cache.entreprise").deleteMany({});

  await getDbCollection("formation").updateMany(
    {
      "formateur.organisme.etablissement": { $exists: true },
      "formateur.organisme.etablissement.geopoint": { $exists: false },
    },
    {
      $set: { "formateur.organisme.etablissement.geopoint": null },
    },
    { bypassDocumentValidation: true }
  );
  await getDbCollection("formation").updateMany(
    {
      "responsable.organisme.etablissement": { $exists: true },
      "responsable.organisme.etablissement.geopoint": { $exists: false },
    },
    {
      $set: { "responsable.organisme.etablissement.geopoint": null },
    },
    { bypassDocumentValidation: true }
  );
  await addJob({
    name: "import:organismes",
    payload: { force: true },
    queued: true,
  });

  await getDbCollection("source.kit_apprentissage").deleteMany({
    // @ts-expect-error
    cfd: null,
  });
  await getDbCollection("source.kit_apprentissage").deleteMany({
    // @ts-expect-error
    rncp: null,
  });
};

export const requireShutdown: boolean = true;
