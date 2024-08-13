import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("users").updateMany(
    {},
    {
      $unset: {
        api_key: true,
        api_key_last_used_at: true,
      },
      $set: { api_keys: [] },
    },
    {
      bypassDocumentValidation: true,
    }
  );
};
