import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  getDbCollection("organisme").updateMany(
    {
      "etablissement.enseigne": "",
    },
    {
      $set: {
        "etablissement.enseigne": null,
      },
    },
    { bypassDocumentValidation: true }
  );
};

export const requireShutdown: boolean = false;
