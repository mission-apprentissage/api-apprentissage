import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("commune").updateMany(
    {},
    { $set: { mission_locale: null } },
    { bypassDocumentValidation: true }
  );
};
