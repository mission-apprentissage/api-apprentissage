import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("users").updateMany(
    { organisation: { $exists: false } },
    { $set: { organisation: null } },
    { bypassDocumentValidation: true }
  );
};
