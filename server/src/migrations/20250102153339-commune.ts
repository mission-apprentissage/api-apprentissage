import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("commune").updateMany(
    { arrondissements: { $exists: false } },
    { $set: { arrondissements: [] } }
  );
  await getDbCollection("commune").updateMany({ anciennes: { $exists: false } }, { $set: { anciennes: [] } });
};
