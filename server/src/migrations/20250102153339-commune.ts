import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("commune").updateMany(
    { arrondissements: { $exists: false } },
    { $set: { arrondissements: [] } },
    { bypassDocumentValidation: true }
  );
  await getDbCollection("commune").updateMany(
    { anciennes: { $exists: false } },
    { $set: { anciennes: [] } },
    { bypassDocumentValidation: true }
  );
};
