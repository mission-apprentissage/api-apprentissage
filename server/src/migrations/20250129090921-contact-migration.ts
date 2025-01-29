import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("organisme").updateMany(
    {
      contacts: { $exists: false },
    },
    { $set: { contacts: [] } },
    { bypassDocumentValidation: true }
  );
  await getDbCollection("formation").updateMany(
    {
      "formateur.organisme": { $ne: null },
      "formateur.organisme.contacts": { $exists: false },
    },
    { $set: { "formateur.organisme.contacts": [] } },
    { bypassDocumentValidation: true }
  );
  await getDbCollection("formation").updateMany(
    {
      "responsable.organisme": { $ne: null },
      "responsable.organisme.contacts": { $exists: false },
    },
    { $set: { "responsable.organisme.contacts": [] } },
    { bypassDocumentValidation: true }
  );
};

export const requireShutdown: boolean = true;
